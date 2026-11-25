import React from 'react';
import { academic } from '../data/sample.js';

export default function CreditTable() {
  return <div className="table-scroll"><table>
    <thead><tr><th scope="col">영역</th><th scope="col">취득 학점</th><th scope="col">요구 학점</th><th scope="col">부족 학점</th></tr></thead>
    <tbody>{academic.areas.map(area => <tr key={area.name}>
      <th scope="row">{area.name}</th><td>{area.earned ?? '미제공'}</td>
      <td>{area.required ?? '미제공'}</td><td>{area.remaining ?? '미제공'}</td>
    </tr>)}</tbody>
  </table></div>;
}
