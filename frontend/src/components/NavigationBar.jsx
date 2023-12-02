import { Navbar, Nav } from 'rsuite';
import {
    MdExitToApp,
    MdOutlineAccountCircle,
    MdEdit
} from "react-icons/md";
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { authStateAtom } from '../recoil/atoms';
import api from '../api';

export default function NavigationBar() {

    const authState = useRecoilValue(authStateAtom);
    const resetAuthState = useResetRecoilState(authStateAtom);

    const handleLogout = () => {
        api.post('/user/logout')
            .then(() => {
                resetAuthState();
            })
            .catch((err) => { console.log(err) })
    }

    const handlePasswordChange = () => {
        let new_pass = prompt('type a new password')
        let confirm_pass = prompt('retype your new password')
        if (new_pass && confirm_pass) {
            if (new_pass === confirm_pass) {
                api.put('/user/password', {
                    password: new_pass
                })
                    .then(() => { alert('password successfully changed!') })
                    .catch((err) => { console.log(err) })
            } else {
                alert('new password does not match retyped password!');
            }
        }
    }

    return (
        <Navbar className='pm-navbar' appearance='inverse'>
            <Navbar.Brand>Task Manager</Navbar.Brand>
            <Nav pullRight>
                <Nav.Menu icon={<MdOutlineAccountCircle />} title={`${authState.firstName} ${authState.lastName}`}>
                    <Nav.Item
                        eventKey="my_user"
                        icon={<MdExitToApp />}
                        onClick={handleLogout}
                    >
                        Logout
                    </Nav.Item>
                    <Nav.Item
                        onClick={handlePasswordChange}
                        icon={<MdEdit />}
                    >
                        Change Pass
                    </Nav.Item>
                </Nav.Menu>
            </Nav>
        </Navbar>
    )
}