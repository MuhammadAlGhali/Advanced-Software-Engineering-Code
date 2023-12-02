import { useState, useEffect } from "react";
import {
  Container,
  Content,
  Panel,
  PanelGroup,
  Divider,
  Stack,
  Table,
  ButtonToolbar,
  Button,
  IconButton,
  Modal,
  Form,
  InputPicker,
  List,
  Avatar,
  Input,
  DatePicker,
} from "rsuite";
import { useRecoilValue } from "recoil";
import { authStateAtom } from "../recoil/atoms";
import PlusIcon from "@rsuite/icons/Plus";
import TrashIcon from "@rsuite/icons/Trash";
import UserIcon from "@rsuite/icons/legacy/User";

import { EmployeeTemplate } from "../mock/template";

import api from "../api";

const { Column, HeaderCell, Cell } = Table;

const roleOptions = [
  {
    label: "Employee",
    value: 3,
  },
  {
    label: "System Admin",
    value: 1,
  },
  {
    label: "Project Manager",
    value: 2,
  },
];

const statusOptions = [
  {
    label: "Not Started",
    value: 0,
  },
  {
    label: "In Progress",
    value: 1,
  },
  {
    label: "Completed",
    value: 2,
  },
];

const statusName = { 0: "Not Started", 1: "In Progress", 2: "Completed" };
const statusId = { "Not Started": 0, "In Progress": 1, Completed: 2 };

export default function Main() {
  const [tasksList, setTasksList] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [commentsList, setCommentsList] = useState([]);
  const authState = useRecoilValue(authStateAtom);
  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState(EmployeeTemplate);
  const [projModalOpen, setProjModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "" });
  const [cmtModalOpen, setCmtModalOpen] = useState(false);
  const [selectedCmtTask, setSelectedCmtTask] = useState(null);
  const [selectedCmtProject, setSelectedCmtProject] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    task_title: "",
    due_by: new Date(),
    task_type: "",
    description: "",
    assigned_to: 0,
  });

  const getEmployees = () => {
    api.get("/employees").then((res) => {
      setEmployeesList(res.data);
    });
  };

  const getTasks = () => {
    api.get("/projects/tasks").then((res) => {
      const result = res.data.map((item) => {
        return {
          ...item,
          tasks: item.tasks.map((task) => {
            return {
              ...task,
              status: statusName[task.status],
            };
          }),
        };
      });
      setTasksList(result);
    });
  };

  useEffect(() => {
    getTasks();
    getEmployees();
  }, []);

  const handleCommentsView = (task_id, project_id) => {
    setSelectedCmtTask(task_id);
    setSelectedCmtProject(project_id);
    api.get(`/projects/tasks/comments?id=${task_id}`).then((res) => {
      setCommentsList(res.data);
      setCmtModalOpen(true);
    });
  };

  const addComment = (event) => {
    if (event.key === "Enter") {
      api
        .post(`/projects/tasks/comments`, {
          task: selectedCmtTask,
          project: selectedCmtProject,
          comment_text: newComment,
        })
        .then(() => {
          api
            .get(`/projects/tasks/comments?id=${selectedCmtTask}`)
            .then((res) => {
              setCommentsList(res.data);
            });
        });

      setNewComment("");
    }
  };

  const handleAddTask = (project_id) => {
    setSelectedCmtProject(project_id);
    setTaskModalOpen(true);
  };

  const handleSubmitTask = () => {
    const unix_time = Math.floor(newTask.due_by.getTime() / 1000);

    api
      .post("/projects/tasks", {
        task_title: newTask.task_title,
        project: selectedCmtProject,
        due_by: unix_time,
        task_type: newTask.task_type,
        description: newTask.description,
        assigned_to: newTask.assigned_to,
      })
      .then(() => {
        getTasks();
        setTaskModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleDeleteTask = (task_id) => {
    api
      .delete(`/projects/tasks?id=${task_id}`)
      .then(() => {
        getTasks();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const updateTaskStatus = (status_val, task_id) => {
    api
      .put(`/projects/tasks/status?id=${task_id}&newStatus=${status_val}`)
      .then(() => {
        getTasks();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleAddEmployee = () => {
    api.post("/user/register", newEmployee).then(() => {
      getEmployees();
      handleEmpModalClose();
    });
  };

  const handleAddProject = () => {
    api.post("/projects", newProject).then(() => {
      getTasks();
      handleProjModalClose();
    });
  };

  const handleEmpModalClose = () => {
    setNewEmployee(EmployeeTemplate);
    setEmpModalOpen(false);
  };

  const handleProjModalClose = () => {
    setNewProject({ title: "", description: "" });
    setProjModalOpen(false);
  };

  const handleCmtModalClose = () => {
    setNewComment("");
    setCmtModalOpen(false);
  };

  const handleTaskModalClose = () => {
    setNewTask({
      task_title: "",
      due_by: new Date(),
      task_type: "",
      description: "",
      assigned_to: 0,
    });
    setTaskModalOpen(false);
  };

  const ProjectHeader = (props) => {
    const handleDelete = () => {
      api.delete(`projects?id=${props.projectId}`).catch((err) => {
        console.log(err);
      });
      setTasksList((prevList) =>
        prevList.filter((project) => project.id !== props.projectId)
      );
    };

    return (
      <div className="project-header">
        <span>{props.title}</span>
        {authState.role !== "employee" && (
          <span className="pull-right">
            <IconButton
              appearance="primary"
              color="red"
              icon={<TrashIcon />}
              className="project-header-btn"
              onClick={handleDelete}
            >
              Delete Project
            </IconButton>
          </span>
        )}
      </div>
    );
  };

  const EmployeesHeader = () => {
    return (
      <div className="employees-header">
        <span>Employees List</span>
        <span className="pull-right">
          <IconButton
            appearance="primary"
            icon={<PlusIcon />}
            onClick={() => {
              setEmpModalOpen(true);
            }}
          >
            Add Employee
          </IconButton>
        </span>
      </div>
    );
  };

  const EmployeesPanel = () => {
    return (
      <Panel header={<EmployeesHeader />} bordered className="employees-panel">
        <Table data={employeesList} height={250} bordered cellBordered>
          <Column width={60} align="center">
            <HeaderCell>Id</HeaderCell>
            <Cell dataKey="id" />
          </Column>
          <Column width={150}>
            <HeaderCell>Title</HeaderCell>
            <Cell dataKey="title" />
          </Column>
          <Column width={150}>
            <HeaderCell>First Name</HeaderCell>
            <Cell dataKey="firstname" />
          </Column>
          <Column width={150}>
            <HeaderCell>Last Name</HeaderCell>
            <Cell dataKey="lastname" />
          </Column>
          <Column width={180} resizable>
            <HeaderCell>Email</HeaderCell>
            <Cell dataKey="email" />
          </Column>
        </Table>
      </Panel>
    );
  };

  return (
    <Container>
      <Content>
        <Panel>
          <ButtonToolbar className="actions-toolbar">
            {authState.role !== "employee" && (
              <Button
                appearance="ghost"
                onClick={() => {
                  setProjModalOpen(true);
                }}
              >
                Create Project
              </Button>
            )}
          </ButtonToolbar>
          {authState.role === "system_admin" && <EmployeesPanel />}
          <PanelGroup accordion bordered>
            {tasksList.map((project) => {
              return (
                <Panel
                  header={
                    <ProjectHeader
                      title={project.title}
                      projectId={project.id}
                    />
                  }
                  defaultExpanded
                  key={project.id}
                >
                  <Stack spacing={6} direction="column" alignItems="flex-start">
                    <p>
                      {" "}
                      <strong>Description:</strong> {project.description}
                    </p>
                    <p>
                      {" "}
                      <strong>Project Manager:</strong> {project.admin}
                    </p>
                  </Stack>
                  <Divider />
                  <Table
                    data={project.tasks}
                    height={250}
                    bordered
                    cellBordered
                  >
                    <Column width={60} align="center">
                      <HeaderCell>Id</HeaderCell>
                      <Cell dataKey="id" />
                    </Column>
                    <Column width={150}>
                      <HeaderCell>Title</HeaderCell>
                      <Cell dataKey="task_title" />
                    </Column>
                    <Column width={150}>
                      <HeaderCell>Task Type</HeaderCell>
                      <Cell dataKey="task_type" />
                    </Column>
                    <Column width={300} resizable>
                      <HeaderCell>Description</HeaderCell>
                      <Cell dataKey="description" />
                    </Column>
                    <Column width={200} resizable>
                      <HeaderCell>Created On</HeaderCell>
                      <Cell dataKey="created_on" />
                    </Column>
                    <Column width={200} resizable>
                      <HeaderCell>Due By</HeaderCell>
                      <Cell dataKey="due_by" />
                    </Column>
                    <Column width={150}>
                      <HeaderCell>Assigned To</HeaderCell>
                      <Cell dataKey="assigned_to" />
                    </Column>
                    <Column width={150}>
                      <HeaderCell>Status</HeaderCell>
                      <Cell>
                        {(rowData) => (
                          <InputPicker
                            data={statusOptions}
                            style={{ width: 224 }}
                            value={statusId[rowData.status]}
                            onChange={(val) => {
                              updateTaskStatus(val, rowData.id);
                            }}
                            cleanable={false}
                          />
                        )}
                      </Cell>
                    </Column>
                    <Column width={80} fixed="right">
                      <HeaderCell>Comments</HeaderCell>
                      <Cell>
                        {(rowData) => (
                          <span
                            onClick={() => {
                              handleCommentsView(rowData.id, project.id);
                            }}
                            className="asLink"
                          >
                            View
                          </span>
                        )}
                      </Cell>
                    </Column>
                    {authState.role !== "employee" && (
                      <Column width={80} fixed="right">
                        <HeaderCell>Delete</HeaderCell>
                        <Cell>
                          {(rowData) => (
                            <IconButton
                              appearance="primary"
                              icon={<TrashIcon />}
                              color="red"
                              onClick={() => {
                                handleDeleteTask(rowData.id);
                              }}
                            />
                          )}
                        </Cell>
                      </Column>
                    )}
                  </Table>
                  {authState.role !== "employee" && (
                    <div className="add-task">
                      <IconButton
                        appearance="primary"
                        color="green"
                        icon={<PlusIcon />}
                        onClick={() => {
                          handleAddTask(project.id);
                        }}
                      >
                        Add Task
                      </IconButton>
                    </div>
                  )}
                </Panel>
              );
            })}
          </PanelGroup>
        </Panel>
        <Modal
          backdrop={true}
          keyboard={false}
          open={empModalOpen}
          onClose={handleEmpModalClose}
        >
          <Modal.Header>
            <Modal.Title>Add Employee</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form
              formValue={newEmployee}
              onChange={setNewEmployee}
              onSubmit={handleAddEmployee}
            >
              <Form.Group controlId="email">
                <Form.ControlLabel>Email</Form.ControlLabel>
                <Form.Control name="email" type="email" required />
              </Form.Group>
              <Form.Group controlId="firstname">
                <Form.ControlLabel>First Name</Form.ControlLabel>
                <Form.Control name="firstname" required />
              </Form.Group>
              <Form.Group controlId="lastname">
                <Form.ControlLabel>Last Name</Form.ControlLabel>
                <Form.Control name="lastname" required />
              </Form.Group>
              <Form.Group controlId="password">
                <Form.ControlLabel>Password</Form.ControlLabel>
                <Form.Control
                  name="password"
                  type="password"
                  autoComplete="off"
                  required
                />
              </Form.Group>
              <Form.Group controlId="role">
                <Form.ControlLabel>Role</Form.ControlLabel>
                <Form.Control
                  name="role"
                  accepter={InputPicker}
                  data={roleOptions}
                  required
                />
              </Form.Group>
              <Form.Group>
                <ButtonToolbar>
                  <Button appearance="primary" type="submit">
                    Add user
                  </Button>
                  <Button onClick={handleEmpModalClose} appearance="default">
                    Cancel
                  </Button>
                </ButtonToolbar>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer></Modal.Footer>
        </Modal>

        <Modal
          backdrop={true}
          keyboard={false}
          open={projModalOpen}
          onClose={handleProjModalClose}
        >
          <Modal.Header>
            <Modal.Title>Create Project</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form
              formValue={newProject}
              onChange={setNewProject}
              onSubmit={handleAddProject}
            >
              <Form.Group controlId="title">
                <Form.ControlLabel>Title</Form.ControlLabel>
                <Form.Control name="title" required />
              </Form.Group>
              <Form.Group controlId="description">
                <Form.ControlLabel>Description</Form.ControlLabel>
                <Form.Control name="description" required />
              </Form.Group>
              <Form.Group>
                <ButtonToolbar>
                  <Button appearance="primary" type="submit">
                    Add Project
                  </Button>
                  <Button onClick={handleProjModalClose} appearance="default">
                    Cancel
                  </Button>
                </ButtonToolbar>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer></Modal.Footer>
        </Modal>

        <Modal
          backdrop={true}
          keyboard={false}
          open={cmtModalOpen}
          onClose={handleCmtModalClose}
        >
          <Modal.Header>
            <Modal.Title>Task Comments</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <List>
              {commentsList.map((comment) => (
                <List.Item key={comment.id}>
                  <Stack spacing={6}>
                    <Avatar>
                      <UserIcon />
                    </Avatar>
                    <span>{comment.comment_by} commented:</span>
                    <span>
                      <strong>{comment.comment_text}</strong>{" "}
                    </span>
                  </Stack>
                  <span className="comment-date">
                    {new Date(comment.created_on * 1000).toLocaleString()}
                  </span>
                </List.Item>
              ))}
              {commentsList.length === 0 && (
                <List.Item>No Comments Found</List.Item>
              )}
              <List.Item>
                <Stack spacing={12}>
                  <Avatar>
                    <UserIcon />
                  </Avatar>
                  <Input
                    className="comment-input"
                    placeholder="Write comment..."
                    value={newComment}
                    onChange={setNewComment}
                    onKeyDown={addComment}
                  />
                </Stack>
              </List.Item>
            </List>
          </Modal.Body>
          <Modal.Footer></Modal.Footer>
        </Modal>

        <Modal
          backdrop={true}
          keyboard={false}
          open={taskModalOpen}
          onClose={handleTaskModalClose}
        >
          <Modal.Header>
            <Modal.Title>Create Task</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form
              formValue={newTask}
              onChange={setNewTask}
              onSubmit={handleSubmitTask}
            >
              <Form.Group controlId="task_title">
                <Form.ControlLabel>Task Title</Form.ControlLabel>
                <Form.Control name="task_title" required />
              </Form.Group>
              <Form.Group controlId="due_by">
                <Form.ControlLabel>Due By</Form.ControlLabel>
                <Form.Control
                  name="due_by"
                  accepter={DatePicker}
                  format="yyyy-MM-dd HH:mm"
                  required
                />
              </Form.Group>
              <Form.Group controlId="task_type">
                <Form.ControlLabel>Task Type</Form.ControlLabel>
                <Form.Control name="task_type" required />
              </Form.Group>
              <Form.Group controlId="description">
                <Form.ControlLabel>Description</Form.ControlLabel>
                <Form.Control name="description" required />
              </Form.Group>
              <Form.Group controlId="assigned_to">
                <Form.ControlLabel>Assigned To</Form.ControlLabel>
                <Form.Control
                  name="assigned_to"
                  accepter={InputPicker}
                  data={employeesList.map((emp) => {
                    return {
                      label: emp.email,
                      value: emp.id,
                    };
                  })}
                  required
                />
              </Form.Group>
              <Form.Group>
                <ButtonToolbar>
                  <Button appearance="primary" type="submit">
                    Add Task
                  </Button>
                  <Button onClick={handleTaskModalClose} appearance="default">
                    Cancel
                  </Button>
                </ButtonToolbar>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer></Modal.Footer>
        </Modal>
      </Content>
    </Container>
  );
}
