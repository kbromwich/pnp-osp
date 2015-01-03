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
    instanceId = kwargs.get('instanceId')
    if instanceId is None:
        instanceId = binascii.b2a_hex(os.urandom(3))
    return render_template('index.html', instanceId=instanceId)
