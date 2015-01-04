# coding: utf-8
import json
import datetime
import random
import re

INSTANCES = {}

class Instance(object):
    
    def __init__(self, instanceId):
        self.instanceId = instanceId
        self.clients = {}
        self.history_draws = []
        self.history_texts = []
        self.last_client_time = datetime.datetime.utcnow()
    
    def add_client(self, ws, msg):
        meta = self.extract_client_meta(ws, msg)
        name = meta['username']
        self.announce(name + ' has connected.')
        self.clients[ws] = meta
    
    def remove_client(self, ws):
        meta = self.clients[ws]
        del self.clients[ws]
        name = meta['username']
        self.announce(name + ' has disconnected.')
        self.last_client_time = datetime.datetime.utcnow()
        if len(self.clients) == 0:
            # TODO: queue task to remove instance after 30 mins
            pass
            
    def rename_client(self, ws, prev_meta):
        prev = prev_meta['username'];
        name = get_client_name(ws)
        self.announce('{0} has changed their name to {1}'.format(prev, name))
        
    def get_client_name(self, client):
        return self.clients[client]['username']
        
    def on_client_message(self, ws, msg):
        prev_meta = self.clients[ws].copy();
        self.clients[ws].update(self.extract_client_meta(ws, msg))
        if msg['type'] == 'refresh':
            self.refresh_client(ws)
        elif msg['type'] == 'rename':
            self.rename_client(ws, prev_meta)
        elif msg['type'] == 'text':
            self.broadcast_text(msg)
        elif msg['type'] == 'draw':
            self.broadcast_draw(msg)
        elif msg['type'] == 'dice':
            self.client_dice_roll(ws, msg)
        
    def extract_client_meta(self, ws, msg):
        meta = {}
        if msg.get('username') is not None:
            meta['username'] = msg['username']
        return meta
            
    def refresh_client(self, client):
        self.send_client_texts(client, self.history_texts)
        self.send_client_draws(client, self.history_draws)
        
    def client_dice_roll(self, client, msg):
        diceMatch = re.match("^D(\d+)$", msg['dice'], flags=re.I)
        dice = int(diceMatch.group(1))
        roll = random.randint(1, dice)
        self.announce('{0} rolled a D{1:d} and got {2:d}'.format(
                        self.get_client_name(client), dice, roll))
        
    def announce(self, message):
        msg = {'instanceId': self.instanceId}
        msg['username'] = 'System'
        msg['text'] = message
        self.broadcast_text(msg)
        
    def broadcast_text(self, msg):
        msg['date'] = get_now()
        self.history_texts.append(msg)
        for client in self.clients:
            self.send_client_texts(client, [msg])
        
    def send_client_texts(self, client, texts):
        reply = {'type': 'text'}
        reply['instanceId'] = self.instanceId
        reply['messages'] = texts
        client.send(json.dumps(reply))
        
    def broadcast_draw(self, msg):
        msg['date'] = get_now()
        self.history_draws.append(msg)
        for client in self.clients:
            self.send_client_draws(client, [msg])
        
    def send_client_draws(self, client, draws):
        reply = {'type': 'draw'}
        reply['instanceId'] = self.instanceId
        reply['draws'] = draws
        client.send(json.dumps(reply))
        
        
def get_now():
    now = datetime.datetime.utcnow()
    return now.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
        
def get_instance(instanceId):
    if INSTANCES.get(instanceId) is None:
        print "Creating instance for", instanceId
        INSTANCES[instanceId] = Instance(instanceId)
    return INSTANCES[instanceId]