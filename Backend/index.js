const express = require("express");
const app = express();
const PORT = 5000;
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");
const { url } = require("inspector");
const { title } = require("process");
const e = require("express");

//USE THE DATABASE MANAGER
const dbm = require("./databaseManager").getDatabaseManagerInstance();

const whitelist = new Set([
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
]);

const corsOptions = {
  credentials: true,
  optionsSuccessStatus: 200,
  origin: function (origin, callback) {
    if (whitelist.has(origin) || origin == undefined) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Create session and cookies
app.use(cookieParser("task-manager-server"));
app.use(
  session({
    secret: "task-manager-server",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      maxAge: 3000 * 60 * 10, // 20 minutes
      sameSite: "none",
      secure: true,
    },
  })
);

//--------------Routes----------------

//Server Checking Route
app.get("/", (req, res) => {
  res.send("Task Manager Server Running");
});
//End Server Checking Route

//--------------------Start Authentication Routes--------------------

//Add User
app.post("/api/user/register", (req, res) => {
  const input = req.body;
  email = input.email;
  firstname = input.firstname;
  lastname = input.lastname;
  password = input.password;
  role = input.role;
  if (req.session.email && req.session.isAdmin) {
    if (email && firstname && lastname && password && role) {
      const result = dbm.registerUser(
        email,
        firstname,
        lastname,
        password,
        role
      );
      result
        .then((output) => {
          res.status(200).json("New User Added");
        })
        .catch((err) => {
          res.status(400).json("User already exist");
        });
    } else {
      res
        .status(400)
        .json(
          "Should add to request body: email, firstName, lastName, password"
        );
    }
  } else {
    res
      .status(401)
      .status("You should be logged in as a system admin to add new users");
  }
});
//End Add User

//Login User
app.post("/api/user/login", (req, res) => {
  const input = req.body;
  const valid = input.email && input.password;
  if (valid) {
    const result = dbm.getUser(input.email);
    result
      .then((output) => {
        if ((output.length = 1)) {
          const user = output[0];

          if (user.pass == input.password) {
            if (req.session.email) {
              res.status(200).json("User Already Logged in");
            } else {
              req.session.email = user.email;
              req.session.userId = user.id;
              if (user.role == 1) {
                req.session.isAdmin = true;
              } else if (user.role == 2) {
                req.session.isManager = true;
              } else {
                req.session.isAdmin = false;
                req.session.isManager = false;
              }
              var message = " logged in successfully";

              res
                .status(200)
                .json(user.firstname + " " + user.lastname + message);
            }
          } else {
            res.status(401).json("Wrong Password");
          }
        }
        return;
      })
      .catch(() => res.status(400).json("User not Registered"));
  } else {
    res.status(400).json("Email and/or Password missing");
  }
});
//End Login User

//Logout User
app.post("/api/user/logout", (req, res) => {
  if (req.session.email) {
    req.session.destroy();
    res.status(200).json("Logged out successfully");
  } else {
    res.status(400).json("No user logged in");
  }
});
//End logout

//Get the User Information
app.get("/api/user", (req, res) => {
  if (req.session.email) {
    let result = dbm.getUser(req.session.email);
    result
      .then((output) => {
        let user = output[0];
        let response;
        if (user.role == 1) {
          req.session.isAdmin = true;
          req.session.role = "system_admin";
        } else if (user.role == 2) {
          req.session.isManager = true;
          req.session.role = "manager";
        } else {
          req.session.isAdmin = false;
          req.session.isManager = false;
          req.session.role = "employee";
        }

        response = {
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          role: req.session.role,
        };

        res.json(response);
      })
      .catch((err) => console.log(err));
  } else {
    res.status(401).json("Should be logged in to get user");
  }
});

app.put("/api/user/password", (req, res) => {
  if (req.session.email) {
    if (req.body.password) {
      let data = dbm.updatePassword(req.session.email, req.body.password);
      data
        .then((output) => {
          if (output.affectedRows > 0) {
            res.status(200).json("Password Changed Successfully");
          } else {
            res.status(400).json("No passwords where edited");
          }
        })
        .catch((err) => console.log(err));
    } else {
      res.status(400).json("You need to provide a new password");
    }
  } else {
    res.status(400).json("You should be logged in to change password");
  }
});
//End get user information

//--------------------End Authentication Routes--------------------

//--------------------Project Admin Related Routes--------------------

//Get all employees
app.get("/api/employees", (req, res) => {
  if (req.session.email) {
    if (req.session.isAdmin || req.session.isManager) {
      const employees = dbm.getAllEmployees();
      employees
        .then((employee) => {
          res.status(200).json(employee);
        })
        .catch(() => {
          res.status(400).json("Couldn't get all employees");
        });
    } else {
      res
        .status(401)
        .json("You should be an admin or project manager to get all users");
    }
  } else {
    res.status(400).json("Should be logged in to get all employees");
  }
});

//Post a project to the project list
app.post("/api/projects", (req, res) => {
  const pdata = req.body;
  if (req.session.email) {
    if (req.session.isAdmin || req.session.isManager) {
      const isValid = pdata.title && pdata.description;
      if (isValid) {
        let projectPost = dbm.addProject(
          pdata.title,
          pdata.description,
          req.session.userId
        );
        projectPost
          .then(() => {
            res.status(200).json("Project Added Successfully!");
          })
          .catch((err) => {
            console.log(err);
            res.status(400).json("Couldn't add project");
          });
      } else {
        res.status(400).json("Project title and/or description missing");
      }
    } else {
      res.status(401).json("Non-Admin or non-Manager users can't add projects");
    }
  } else {
    res.status(400).json("You should login to add a project");
  }
});

//delete project from the project list
app.delete("/api/projects", (req, res) => {
  if (req.session.email) {
    if (req.session.isAdmin || req.session.isManager) {
      let projDelete = dbm.deleteProject(req.query.id);
      projDelete
        .then((project) => {
          if (project.affectedRows > 0)
            res.status(200).json("Project Deleted Successfuly");
        })
        .catch(() => {
          res.status(400).json("Couldn't Delete project");
        });
    } else {
      res
        .status(401)
        .json("You should be an admin or manager to delete project");
    }
  } else {
    res.status(400).json("Should be logged in");
  }
});

//get All projects with tasks
app.get("/api/projects/tasks", (req, res) => {
  if (req.session.email) {
    let tasks;
    if (req.session.isAdmin) {
      tasks = dbm.getAllProjectsWithTasks();
    } else if (req.session.isManager) {
      tasks = dbm.getAllProjectsWithTasksForManager(req.session.email);
    } else {
      tasks = dbm.getAllProjectsWithTasksForEmployee(req.session.email);
    }
    tasks.then((task) => {
      let result = [];
      let projects_tasks = {};
      let projects = {};
      let project_ids = [];
      task.forEach((element) => {
        let taskItem = {
          id: element.t_id,
          task_title: element.task_title,
          description: element.t_desc,
          created_on: new Date(element.created_on * 1000).toLocaleString(),
          status: element.status,
          due_by: new Date(element.due_by * 1000).toLocaleString(),
          assigned_to: element.employee,
          task_type: element.task_type,
        };
        taskItem = element.t_id ? taskItem : undefined;
        if (!project_ids.includes(element.p_id)) {
          project_ids.push(element.p_id);
          if (taskItem) {
            projects_tasks[element.p_id] = [taskItem];
          } else {
            projects_tasks[element.p_id] = [];
          }

          let projectItem = {
            id: element.p_id,
            title: element.title,
            description: element.p_desc,
            admin: element.admin,
          };
          projects[element.p_id] = projectItem;
        } else {
          projects_tasks[element.p_id].push(taskItem);
        }
      });
      project_ids.forEach((project_id) => {
        let projectData = {
          ...projects[project_id],
          tasks: projects_tasks[project_id],
        };

        result.push(projectData);
      });
      res.json(result);
    });
  } else {
    res.status(401).json("You should be logged in to get tasks");
  }
});

//Add task for an employee on a specific project
app.post("/api/projects/tasks", (req, res) => {
  const taskData = req.body;
  const isValid =
    taskData.task_title &&
    taskData.project &&
    taskData.due_by &&
    taskData.task_type &&
    taskData.description &&
    taskData.assigned_to;

  if (req.session.email) {
    if (req.session.isAdmin || req.session.isManager) {
      if (isValid) {
        let projectPostTask = dbm.addTaskForProject(
          taskData.task_title,
          taskData.project,
          new Date().getTime() / 1000,
          taskData.due_by,
          taskData.task_type,
          taskData.description,
          taskData.assigned_to
        );
        projectPostTask
          .then(() => {
            res.status(200).json("Project task Added Successfully!");
          })
          .catch((err) => {
            console.log(err);
            res.status(400).json("Couldn't add project Task");
          });
      } else {
        res
          .status(400)
          .json(
            "Project title and/or taskdesc and/or employee and/or role and/or taskname missing"
          );
      }
    } else {
      res.status(401).json("Non-Admin users can't add project tasks");
    }
  } else {
    res.status(400).json("You should login to post a project task");
  }
});
//end post project task for an employee

//delete a task for an employee
app.delete("/api/projects/tasks", (req, res) => {
  if (req.session.email) {
    if (req.session.isAdmin || req.session.isManager) {
      if (req.query.id) {
        let projectTaskDelete = dbm.deleteTask(req.query.id);
        projectTaskDelete
          .then((projectTasks) => {
            if (projectTasks.affectedRows > 0)
              res.status(200).json("Task Deleted Successfuly");
          })
          .catch(() => {
            res.status(400).json("Couldn't Delete project task");
          });
      } else {
        res.status(400).json("Project id missing");
      }
    } else {
      res.status(401).json("Non-Admin users can't delete project tasks");
    }
  } else {
    res.status(400).json("You should login delete a project's tasks");
  }
});

//--------------------End Project Admin Related Routes--------------------

//--------------------Start Project's Task Related Routes--------------------
app.get("/api/projects/tasks/comments", (req, res) => {
  const task = req.query.id;
  if (req.session.email) {
    if (task) {
      const comments = dbm.getTaskComments(task);
      comments
        .then((comment) => {
          res.status(200).json(comment);
        })
        .catch(() => {
          res.status(400).json("Can't get comments");
        });
    } else {
      res.status(400).json("No task name provided");
    }
  } else {
    res.status(400).json("you should be logged in to get comments");
  }
});
app.post("/api/projects/tasks/comments", (req, res) => {
  const commentData = req.body;
  const isValid =
    commentData.task && commentData.project && commentData.comment_text;

  if (req.session.email) {
    if (isValid) {
      const comments = dbm.addTaskComment(
        commentData.task,
        commentData.project,
        commentData.comment_text,
        new Date().getTime() / 1000,
        req.session.userId
      );
      comments
        .then(() => {
          res.status(200).json("Comment added Successfully");
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json("Can't add comment");
        });
    } else {
      res
        .status(400)
        .json(
          "No taskid and/or projectId and/or created_on date  and/or commentText  provided"
        );
    }
  } else {
    res.status(400).json("you should be logged in to add comments");
  }
});
app.put("/api/projects/tasks/status", (req, res) => {
  const task = req.query;
  const isValid = task.id && task.newStatus;
  if (req.session.email) {
    if (isValid) {
      const employeeTaskStatus = dbm.editTaskStatus(task.id, task.newStatus);
      employeeTaskStatus
        .then((output) => {
          if (output.affectedRows > 0) {
            res.status(200).json("status Changed Successfully");
          } else {
            res.status(400).json("No status was edited");
          }
        })
        .catch(() => {
          res.status(400).json("Can't change status");
        });
    } else {
      res
        .status(400)
        .json("You need tp provide project title and the taskname");
    }
  } else {
    res.status(400).json("No user logged in to change his/her task's status");
  }
});

//--------------------End Project's Task Related Routes--------------------

//Listener
app.listen(PORT, (req, res) => {
  console.log(`Listening on port ${PORT}`);
});
