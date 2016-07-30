import React from 'react';
import ReactPlayer from 'react-player'

class YouTubeVideo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      played: 0,
      loaded: 0,
      duration: 0
    }

    this.emitPlayAndListenForPause = this.props.emitPlayAndListenForPause.bind(this);
    this.emitPauseAndListenForPlay = this.props.emitPauseAndListenForPlay.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.handleEnd = this.props.handleEnd.bind(this);
  }

  componentDidMount() {
    this.props.initVoice();
    this.initListeners();
  }

  initListeners() {
    this.props.socket.on('go back', () => {
      console.log('go back message received, about to sync');
      var currentTime = Math.floor(this.state.played * this.state.duration);
      var targetTime = Math.floor(currentTime - 10, 0);
      var targetFraction = targetTime / this.state.duration;
      this.syncVideos(this.state.played, targetFraction);
    });

    this.props.socket.on('progress', (otherProgress) => {
      // Sync videos if they are way off:
      this.syncVideos(this.state.played, otherProgress.played);
    });
  }

  syncVideos(currentPlayedFraction, otherPlayedFraction) {
    var currentTime = Math.floor(currentPlayedFraction * this.state.duration);
    var otherTime = Math.floor(otherPlayedFraction * this.state.duration);

    if (currentTime > otherTime + 0.5 || currentTime < otherTime - 0.5) {
      this.refs.player.seekTo(otherPlayedFraction);
    }
  }

  onProgress(state) {
    this.setState(state);
    // emit the progress of the video so server can listen and keep the two peers in sync
    this.props.socket.emit('progress', state);
  }

  render () {
    return (
      <ReactPlayer
        ref='player'
        url={ this.props.url }
        controls
        playing={ this.props.playing }
        volume={ this.props.volume }
        onPlay={ this.emitPlayAndListenForPause }
        onPause={ this.emitPauseAndListenForPlay }
        onProgress = { this.onProgress }
        progressFrequency = { 250 }
        onDuration = { duration => this.setState({ duration }) }
        onEnded = { this.handleEnd }
      />
    )
  }
}

export default YouTubeVideo;
