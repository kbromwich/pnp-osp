# coding: utf-8
import json
from instance import get_instance

def handle_websocket(ws):
    instance = None
    while True:
        message = ws.receive()
        if message is None:
            if instance is not None:
                instance.remove_client(ws)
            break
        else:
            message = json.loads(message)
            if instance is None:
                instance = get_instance(message['instanceId'])
                instance.add_client(ws, message)
            instance.on_client_message(ws, message)
            