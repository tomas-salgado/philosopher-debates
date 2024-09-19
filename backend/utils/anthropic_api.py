import os
import anthropic
import logging

class AnthropicAPI:
    def __init__(self):
        logging.debug("Initializing AnthropicAPI")
        api_key = os.getenv("ANTHROPIC_API_KEY")
        
        if not api_key:
            logging.error("ANTHROPIC_API_KEY environment variable is not set")
            raise ValueError("ANTHROPIC_API_KEY environment variable is not set")
        
        self.client = anthropic.Anthropic(api_key=api_key)
        self.conversation_history = []
        logging.info("AnthropicAPI initialized successfully")

    def start_conversation(self):
        """
        Starts a new conversation by clearing the conversation history.
        """
        logging.debug("Starting a new conversation")
        self.conversation_history = []
        logging.info("Conversation history cleared")

    def send_user_message(self, message):
        """
        Sends a user message to the conversation history. If it's the first message,
        it initializes the conversation context with a philosophical debate prompt.

        Args:
            message (str): The message from the user.
        """
        logging.debug(f"Sending user message: {message}")
        if len(self.conversation_history) == 0:
            message = "We're going to have a philosophical debate between AI philosophers. " + message
        self.conversation_history.append({"role": "user", "content": message})
        logging.info("User message added to conversation history")

    def get_philosopher_B_response_to_philosopher_A(self, philosopher_A, philosopher_B):
        """
        Generates a response from philosopher B to philosopher A's message
        and appends it to the conversation history.

        Args:
            philosopher_A (str): The name of philosopher A.
            philosopher_B (str): The name of philosopher B.

        Returns:
            str: The response from philosopher B.
        """
        logging.debug(f"Generating response from {philosopher_B} to {philosopher_A}")
        message = f"Continue the debate with {philosopher_B}'s response to {philosopher_A}'s message."
        self.conversation_history.append({"role": "user", "content": message})
        response = self.get_philosopher_response(philosopher_B)
        logging.info(f"Response from {philosopher_B} obtained")
        return response

    def get_philosopher_response(self, philosopher):
        """
        Retrieves the response from the specified philosopher based on the
        current conversation history.

        Args:
            philosopher (str): The name of the philosopher.

        Returns:
            str: The response from the philosopher.
        """
        logging.debug(f"Retrieving response for philosopher: {philosopher}")
        system_prompt = self.get_philosopher_prompt(philosopher)
        philosopher_response = self.call_api(system_prompt)
        self.conversation_history.append({"role": "assistant", "content": philosopher_response})
        logging.info("Philosopher response added to conversation history")
        return philosopher_response

    def get_philosopher_prompt(self, philosopher):
        """
        Retrieves the system prompt for the given philosopher from a text file.

        Args:
            philosopher (str): The name of the philosopher.

        Returns:
            str: The system prompt for the philosopher.
        """
        logging.debug(f"Retrieving prompt for philosopher: {philosopher}")
        prompt_file = f"prompts/{philosopher}.txt"
        try:
            with open(prompt_file, 'r') as file:
                prompt = file.read()
                logging.info(f"Prompt for {philosopher} retrieved successfully")
                return prompt
        except FileNotFoundError:
            logging.error(f"Prompt file for {philosopher} not found")
            raise

    def call_api(self, philosopher_prompt):
        """
        Calls the API with the given philosopher's prompt and conversation history,
        streaming the response as it is received.

        Args:
            philosopher_prompt (str): The prompt for the philosopher.

        Returns:
            str: The full response from the API.
        """
        logging.debug("Calling API")
        full_response = ""
        
        with self.client.messages.stream(
            model="claude-3-sonnet-20240229",
            max_tokens=4000,
            temperature=0.7,
            system=philosopher_prompt,
            messages=self.conversation_history
        ) as stream:
            for text in stream.text_stream:
                full_response += text
        logging.info("API response received")
        return full_response