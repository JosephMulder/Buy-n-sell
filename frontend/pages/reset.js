import Link from 'next/link';
import Reset from '../components/Reset';
import { createRef } from 'react';

const ResetPw = props => (
    <div>
        <Reset resetToken={props.query.resetToken}/>
    </div>
);
export default ResetPw;