import { useCallback, useEffect, useState } from 'react'
import { string, bool } from 'prop-types';

import videojs from 'video.js'


interface PlayerProps {
    autoplay: boolean;
    controls: boolean;
    muted: boolean;
    poster?: string;
    preload: string;
    src: string;
    fluid: boolean;
}

const Player = (props: PlayerProps) => {
    const [playerEl, setPlayerEl] = useState<HTMLVideoElement | null>(null)
    const onPlayer = useCallback((el: HTMLVideoElement) => {
      setPlayerEl(el)
    }, [])
  
    useEffect(() => {
      if (playerEl == null) {
        return
      }
  
      const player = videojs(playerEl, props)
      player.src(props.src)

      return () => {
        player.dispose()
      }
    }, [props, playerEl])
  
    return (
        <div data-vjs-player>
          <video ref={onPlayer} className="video-js vjs-16-9" playsInline />
        </div>
    )
  }

Player.defaultProps = {
    autoplay: false,
    controls: false,
    muted: false,
    preload: "none",
    fluid: true,
}

Player.propTypes = {
    autoplay: bool,
    controls: bool,
    muted: bool,
    poster: string,
    preload: string,
    src: string,
    fluid: bool
  };

export default Player;