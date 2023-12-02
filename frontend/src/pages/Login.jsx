import { useState } from "react";
import {
  FlexboxGrid,
  Panel,
  Form,
  ButtonToolbar,
  Button,
  Navbar,
} from "rsuite";
import api from "../api";
import { useSetRecoilState } from "recoil";
import { authStateAtom } from "../recoil/atoms";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [creds, setCreds] = useState({
    email: "",
    password: "",
  });

  const setAuthState = useSetRecoilState(authStateAtom);

  const handleLogin = () => {
    api
      .post("/user/login", creds)
      .then(() => {
        api.get("/user").then((res) => {
          setAuthState({
            email: res.data.email,
            firstName: res.data.firstname,
            lastName: res.data.lastname,
            role: res.data.role,
            authenticated: true,
          });
          navigate("/");
        });
      })
      .catch((err) => {
        alert(err.response.data);
      });
  };

  return (
    <>
      <Navbar className="login-navbar" appearance="inverse">
        <Navbar.Brand>Task Manager</Navbar.Brand>
      </Navbar>
      <div className="login-page">
        <FlexboxGrid justify="center">
          <FlexboxGrid.Item colspan={12}>
            <Panel header={<h3>Login</h3>} bordered>
              <Form
                fluid
                onSubmit={handleLogin}
                formValue={creds}
                onChange={setCreds}
              >
                <Form.Group>
                  <Form.ControlLabel>email address</Form.ControlLabel>
                  <Form.Control name="email" type="email" required />
                </Form.Group>
                <Form.Group>
                  <Form.ControlLabel>Password</Form.ControlLabel>
                  <Form.Control
                    name="password"
                    type="password"
                    autoComplete="off"
                    required
                  />
                </Form.Group>
                <Form.Group>
                  <ButtonToolbar>
                    <Button appearance="primary" type="submit">
                      Sign in
                    </Button>
                    {/* <Button appearance="link">Forgot password?</Button> */}
                  </ButtonToolbar>
                </Form.Group>
              </Form>
            </Panel>
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </div>
    </>
  );
}
