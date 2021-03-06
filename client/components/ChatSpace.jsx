import React from 'react';

import Message from './Message.jsx';
import VideoChat from './VideoChat.jsx';
import { getMyId } from '../lib/webrtc';

class ChatSpace extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      roomId: this.props.peerId,
      message: '',
      messages: [
        { className: 'other', text: 'Begin chatting here.' },
        { className: 'other', text: 'Did you know that you can ' + 
          'control the video player with just your voice? Try it ' + 
          'out with commands like "play", "pause", "go back", "mute", and "unmute"' }
      ],
    };

    // If source, create room using myId
    if (!this.props.peerId) {
      getMyId().then((myId) => {
        this.props.socket.emit('room', myId);
        this.setState({
          roomId: myId,
        });
      })
      .catch(console.error.bind(console));
    } else {
      // If reciever, join room using peerId
      this.props.socket.emit('room', this.props.peerId);
    }

    this.props.socket.on('chat message', (msg) => {
      this.setState({
        messages: this.state.messages.concat({ className: "other", text: msg }),
      });

      if (this.isVideoLink(msg)) {
        this.props.addToPlaylist(msg);
      }
    });

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    const chatSpace = document.querySelector('.chat-space');

    // Show the chat area for a few seconds to let the user know about it, then fade away
    setTimeout(() => {
      chatSpace.style.width = '0px';

      document.addEventListener('mousemove', (e) => {
        if (e.pageX >= window.innerWidth - 300) {
          chatSpace.style.width = '300px';
        } else {
          chatSpace.style.width = '0px';
        }
      });
    }, 3000);
  }

  handleChange(event) {
    this.setState({
      message: event.target.value,
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    var message = this.state.message;

    this.props.socket.emit('chat message', message, this.state.roomId);

    this.setState({
      messages: this.state.messages.concat({ className: 'me', text: message }),
      message: '',
    });

    if (this.isVideoLink(message)) {
      this.props.addToPlaylist(message);
    }
  }

  isVideoLink(message) {
    return message.includes('youtube.com/watch');
  }

  render() {
    return (
      <div className="chat-space">
        <VideoChat isSource={this.props.isSource} peerId={this.props.peerId} />
        <div className="chat-container">
          <ul>
            {this.state.messages.map((message, i) => <Message message={message} key={i} />)}
          </ul>
        </div>
        <form className="chat-form" onSubmit={this.handleSubmit}>
          <input
            type="text"
            id="m"
            className="chat-input"
            value={this.state.message}
            autoComplete="off"
            onChange={this.handleChange}
            placeholder="Send a message..."
          />
          <input type="submit" className="chat-submit" value="Submit" />
        </form>
      </div>
    );
  }
}

ChatSpace.propTypes = {
  socket: React.PropTypes.object.isRequired,
  isSource: React.PropTypes.bool.isRequired,
  peerId: React.PropTypes.string,
};

export default ChatSpace;
