# coding: utf-8
import json
from instance import get_instance

def handle_websocket(ws):
    instance = None
    while True:
        message = ws.receive()
        print "Handling message", message
        if message is None:
            if instance is not None:
                instance.remove_client(ws)
            break
        else:
            message = json.loads(message)
            if instance is None:
                instance = get_instance(message['instanceId'])
                print "Assigning", ws, "to", message['instanceId'], instance
                instance.add_client(ws)
            instance.on_client_message(ws, message)
            