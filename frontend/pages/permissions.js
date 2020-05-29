import CreateItem from '../components/CreateItem';
import PleaseSignIn from '../components/PleaseSignin';
import Permissions from '../components/Permissions';


const PermissionPage = props => (
    <div>
        <PleaseSignIn>
            <Permissions/>
        </PleaseSignIn>
    </div>
);
export default PermissionPage;