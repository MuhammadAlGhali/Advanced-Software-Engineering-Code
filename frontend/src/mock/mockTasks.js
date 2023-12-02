export const mockTasks = [
    {
        id: 1,
        title: 'Password Manager',
        description: 'a password manager app',
        admin: 'najikadri2000@gmail.com',
        tasks: [
            {
                id: 1,
                task_title: 'List Passwords',
                created_on: 12455436,
                status: 0,
                due_by: '12-11-2022',
                task_type: 'frontend',
                description: 'make a view to list all passwords',
                assigned_to: 'najikadri2000@gmail.com'
            },
            {
                id: 2,
                task_title: 'Password CRUD',
                created_on: 12454236,
                status: 1,
                due_by: '12-11-2022',
                task_type: 'backend',
                description: 'create CRUD operations for passwords list',
                assigned_to: 'mghali2000@hotmail.com'
            }
        ]
    },
    {
        id: 2,
        title: 'Tic Tac Toe',
        description: 'multiplayer tic tac toe game',
        admin: 'mghali2000@hotmail.com',
        tasks: [
            {
                id: 1,
                task_title: 'Add Animation',
                created_on: 1234889,
                status: 0,
                due_by: '15-11-2022',
                task_type: 'frontend',
                description: 'add animation to the tic tac toe actions',
                assigned_to: 'mghali2000@hotmail.com'
            },
        ]
    }
]