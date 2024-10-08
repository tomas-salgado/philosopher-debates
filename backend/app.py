from flask import Flask, request, jsonify, render_template, Response, stream_with_context
from flask_cors import CORS
from backend.utils.anthropic_api import AnthropicAPI
import os
import logging

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')
CORS(app) 
api = AnthropicAPI()

@app.route('/')
def index():
    api.start_conversation()
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

    def generate():
        if user_message:
            api.send_user_message(user_message)
            for chunk in api.get_philosopher_response(philosopher):
                yield f"data: {chunk}\n\n"
        else:
            for chunk in api.get_response_to_philosopher(philosopher):
                yield f"data: {chunk}\n\n"
    return Response(generate(), mimetype='text/event-stream')

@app.route('/respond_to_user', methods=['POST'])
def respond_to_user():
    philosopher = request.json.get('philosopher')
    if not philosopher:
        return jsonify({"error": "Philosopher not specified"}), 400
    response = api.get_philosopher_response(philosopher)
    return jsonify({"response": response})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.getenv('PORT', 8080)))
