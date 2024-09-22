from flask import Flask, request, jsonify, render_template
from backend.utils.anthropic_api import AnthropicAPI
import os
import logging

logging.basicConfig(level=logging.DEBUG)

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
    logging.debug("Received a request to /send_message")
    philosopher = request.json.get('philosopher')
    if not philosopher:
        return jsonify({"error": "Philosopher not specified"}), 400
    user_message = request.json.get('message')
    if user_message:
        api.send_user_message(user_message)
        response = api.get_philosopher_response(philosopher)
        return jsonify({"response": response})
    elif not user_message:
        response = api.get_response_to_philosopher(philosopher)
        return jsonify({"response": response})

@app.route('/respond_to_user', methods=['POST'])
def respond_to_user():
    philosopher = request.json.get('philosopher')
    if not philosopher:
        return jsonify({"error": "Philosopher not specified"}), 400
    response = api.get_philosopher_response(philosopher)
    return jsonify({"response": response})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.getenv('PORT', 8080)))
