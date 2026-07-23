"""
WebSocket events handler for real-time Live Chat.
"""

from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import request
import logging

# Initialize without app, we will call init_app in app.py
socketio = SocketIO(cors_allowed_origins="*")

# Active admin connections
active_admins = {}

@socketio.on('connect')
def handle_connect():
    logging.info(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    logging.info(f"Client disconnected: {request.sid}")
    if request.sid in active_admins:
        del active_admins[request.sid]

@socketio.on('join_room')
def handle_join_room(data):
    """
    Users join a room with their user_id.
    Admins join a general 'admin_room' and can also send messages to user_ids.
    """
    room = data.get('room')
    role = data.get('role', 'user') # 'admin' or 'user'
    
    if room:
        join_room(room)
        logging.info(f"Client {request.sid} joined room {room} as {role}")
        
        if role == 'admin':
            active_admins[request.sid] = True
            join_room('admin_room')
            
        emit('room_joined', {'status': 'success', 'room': room})

@socketio.on('send_message')
def handle_send_message(data):
    """
    Broadcast message to the specified room.
    User sends message to room = their user_id.
    Admin listens to all messages or user broadcasts to 'admin_room' and their own room.
    """
    room = data.get('room') # the user_id room
    message = data.get('message')
    sender = data.get('sender') # 'user' or 'admin'
    user_id = data.get('user_id') # To identify who the chat belongs to
    
    if not room or not message:
        return
        
    payload = {
        'message': message,
        'sender': sender,
        'timestamp': data.get('timestamp'),
        'user_id': user_id,
        'room': room
    }
    
    # Broadcast to the specific user's room (so the user sees it if admin replies)
    emit('receive_message', payload, room=room)
    
    # If the sender is 'user', also broadcast to 'admin_room' so all active admins can see it
    if sender == 'user':
        emit('receive_message', payload, room='admin_room')
