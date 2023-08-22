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

function Player(props: PlayerProps)  {
  const [playerEl, setPlayerEl] = useState<HTMLVideoElement | null>(null)
  const [playerr, setPlayerr] = useState<any>(null)
  const [hover, setHover] = useState<boolean>(false)
    const onPlayer = useCallback((el: HTMLVideoElement) => {
      setPlayerEl(el)
    }, [])
  
    useEffect(() => {
      if (playerr != null) {
        return;
      }
      if (playerEl == null) {
        return
      }      
      const player = videojs(playerEl, props)
      player.src(props.src)
      setPlayerr(player)
    }, [props, playerEl, playerr])
  
    return (
        <div data-vjs-player>
          <video 
            // onMouseEnter={() => setHover(true)}
            // onMouseLeave={() => setHover(false)}
            ref={onPlayer} 
            className="video-js vjs-16-9" playsInline
          />
        </div>
        
    )
  }

Player.defaultProps = {
    autoplay: false,
    controls: false,
    muted: false,
    preload: "none",
    fluid: true,
    poster: "https://i.ytimg.com/vi/Jr3tlqXH7is/maxresdefault.jpg",
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