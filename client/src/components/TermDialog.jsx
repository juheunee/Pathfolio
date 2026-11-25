import React, { useEffect, useRef, useState } from 'react';
import { terms } from '../data/sample.js';

export default function TermDialog({ course, onCancel, onAdd }) {
  const dialog = useRef(null);
  const [term, setTerm] = useState('');

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  return <dialog ref={dialog} aria-labelledby="term-title" onCancel={event => {
    event.preventDefault();
    onCancel();
  }}>
    <form onSubmit={event => {
      event.preventDefault();
      if (term) onAdd(course.code, term);
    }}>
      <h2 id="term-title">학기 선택</h2>
      <p><strong>{course.name}</strong> · {course.code} · {course.credits}학점</p>
      <fieldset><legend>배치 학기</legend>
        {terms.map(option => <label className="term-option" key={option.id}>
          <input autoFocus={option === terms[0]} type="radio" name="term" value={option.id}
            checked={term === option.id} onChange={() => setTerm(option.id)} />
          {option.label}
        </label>)}
      </fieldset>
      <div className="actions">
        <button type="button" className="button secondary" onClick={onCancel}>취소</button>
        <button type="submit" className="button" disabled={!term}>추가</button>
      </div>
    </form>
  </dialog>;
}
