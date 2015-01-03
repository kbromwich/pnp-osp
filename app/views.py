# coding: utf-8
import os
import binascii
from flask import render_template
from flask import request

from app import app

@app.route('/')
def index():
    return instance(instanceId=None)

@app.route('/<instanceId>')
def instance(**kwargs):
    template_args = {}
    id = kwargs.get('instanceId')
    if id is None:
        id = binascii.b2a_hex(os.urandom(3))
    template_args['instanceId'] = id
    template_args['clientId'] = short_hash(request.remote_addr)
    return render_template('index.html', **template_args)
    
def short_hash(input):
    return abs(hash(input)) % (10 ** 4)
