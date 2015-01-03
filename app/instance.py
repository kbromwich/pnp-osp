# coding: utf-8
import json

INSTANCES = {}

class Instance(object):
    
    def __init__(self, instanceId):
        self.instanceId = instanceId
        self.clients = set([])
        self.draw_history = []
        self.text_history = []
    
    def add_client(self, ws):
        self.clients.add(ws)
        self.send_client_texts(ws, self.text_history)
    
    def remove_client(self, ws):
        self.clients.remove(ws)
        
    def on_client_message(self, ws, msg):
        text = msg['output']
        self.text_history.append(text)
        for client in self.clients:
            self.send_client_texts(client, [text])
        
    def send_client_texts(self, client, texts):
        reply = {}
        reply['instanceId'] = self.instanceId
        reply['messages'] = texts
        client.send(json.dumps(reply))
        

def get_instance(instanceId):
    if INSTANCES.get(instanceId) is None:
        print "Creating instance for", instanceId
        INSTANCES[instanceId] = Instance(instanceId)
    return INSTANCES[instanceId]