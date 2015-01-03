# coding: utf-8
import json

INSTANCES = {}

class Instance(object):
    
    def __init__(self, instanceId):
        self.instanceId = instanceId
        self.clients = set([])
        self.history_draws = []
        self.history_texts = []
    
    def add_client(self, ws):
        self.clients.add(ws)
    
    def remove_client(self, ws):
        self.clients.remove(ws)
        
    def on_client_message(self, ws, msg):
        if msg['type'] == 'refresh':
            self.refresh_client(ws)
        elif msg['type'] == 'text':
            self.history_texts.append(msg)
            for client in self.clients:
                self.send_client_texts(client, [msg])
        elif msg['type'] == 'draw':
            pass
        elif msg['type'] == 'dice':
            pass
            
    def refresh_client(self, client):
        self.send_client_texts(client, self.history_texts)
        
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