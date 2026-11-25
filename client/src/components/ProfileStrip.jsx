import React from 'react';
import { profile } from '../data/sample.js';

export default function ProfileStrip() {
  return <dl className="panel profile">
    <div><dt>학년·학기</dt><dd>{profile.year}학년 {profile.semester}학기</dd></div>
    <div><dt>입학년도</dt><dd>{profile.entryYear}년</dd></div>
    {profile.tracks.map((track, index) => <div key={track}><dt>{index + 1}트랙</dt><dd>{track}</dd></div>)}
  </dl>;
}
