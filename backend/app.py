from flask import Flask, request, jsonify, render_template
from utils.anthropic_api import AnthropicAPI

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')
api = AnthropicAPI()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/start', methods=['POST'])
def start_conversation():
    api.start_conversation()
    return jsonify({"message": "Conversation started."})

@app.route('/send_message', methods=['POST'])
def send_message():
    user_message = request.json.get('message')
    if not user_message:
        return jsonify({"error": "No message provided"}), 400
    api.send_user_message(user_message)
    return jsonify({"message": "Message received"})

@app.route('/respond_to_user', methods=['POST'])
def respond_to_user():
    philosopher = request.json.get('philosopher')
    if not philosopher:
        return jsonify({"error": "Philosopher not specified"}), 400
    response = api.get_philosopher_response(philosopher)
    return jsonify({"response": response})

@app.route('/philosopher_dialogue', methods=['POST'])
def philosopher_dialogue():
    philosopher_1 = request.json.get('philosopher_1')
    philosopher_2 = request.json.get('philosopher_2')
    if not philosopher_1 or not philosopher_2:
        return jsonify({"error": "Missing philosopher names"}), 400
    response = api.get_philosopher_B_response_to_philosopher_A(philosopher_1, philosopher_2)
    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(debug=True)
