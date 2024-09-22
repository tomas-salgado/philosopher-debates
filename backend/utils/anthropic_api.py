import os
import anthropic

class AnthropicAPI:
    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable is not set")
        self.client = anthropic.Anthropic(api_key=api_key)
        self.conversation_history = []

    def start_conversation(self):
        """
        Starts a new conversation by clearing the conversation history.
        """
        self.conversation_history = []

    def send_user_message(self, message):
        """
        Sends a user message to the conversation history. If it's the first message,
        it initializes the conversation context with a philosophical debate prompt.

        Args:
            message (str): The message from the user.
        """
        if len(self.conversation_history) == 0:
            message = "We're going to have a philosophical debate between AI philosophers. " + message
        self.conversation_history.append({"role": "user", "content": message})

    def get_response_to_philosopher(self, philosopher):
        """
        Generates a streaming response from the philosopher based on the conversation history.

        Args:
            philosopher (str): The name of the philosopher.

        Yields:
            str: Chunks of the response from the philosopher.
        """
        message = f"Continue the debate by responding to the previous message(s)."
        self.conversation_history.append({"role": "user", "content": message})
        yield from self.get_philosopher_response(philosopher)

    def get_philosopher_response(self, philosopher):
        """
        Retrieves the response from the specified philosopher based on the
        current conversation history.

        Args:
            philosopher (str): The name of the philosopher.

        Yields:
            str: Chunks of the response from the philosopher.
        """
        system_prompt = self.get_philosopher_prompt(philosopher)
        full_response = ""
        for chunk in self.call_api(system_prompt):
            full_response += chunk
            yield chunk
        self.conversation_history.append({"role": "assistant", "content": full_response})

    def get_philosopher_prompt(self, philosopher):
        """
        Retrieves the system prompt for the given philosopher from a text file.

        Args:
            philosopher (str): The name of the philosopher.

        Returns:
            str: The system prompt for the philosopher.
        """
        philosopher = philosopher.lower() 
        prompt_file = f"prompts/{philosopher}.txt"
        try:
            with open(prompt_file, 'r') as file:
                return file.read()
        except FileNotFoundError:
            raise FileNotFoundError(f"Prompt file for {philosopher} not found")

    def call_api(self, philosopher_prompt):
        """
        Calls the API with the given philosopher's prompt and conversation history,
        streaming the response as it is received.

        Args:
            philosopher_prompt (str): The prompt for the philosopher.

        Returns:
            str: The full response from the API.
        """
        with self.client.messages.stream(
            model="claude-3-sonnet-20240229",
            max_tokens=4000,
            temperature=0.7,
            system=philosopher_prompt,
            messages=self.conversation_history
        ) as stream:
            for text in stream.text_stream:
                yield text