import Link from 'next/link';
import CreateItem from '../components/CreateItem';
import { createRef } from 'react';
import PleaseSignIn from '../components/PleaseSignin';


const Sell = props => (
    <div>
        <PleaseSignIn>
            <CreateItem/>
        </PleaseSignIn>
    </div>
);
export default Sell;