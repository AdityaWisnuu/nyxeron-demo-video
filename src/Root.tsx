import React from 'react'
import { Composition } from 'remotion'
import { FILM_LEN, Film } from './Film'
import { FPS } from './kit'
export const Root: React.FC = () => <Composition id="Film" component={Film} durationInFrames={FILM_LEN} fps={FPS} width={1920} height={1080} />
