import AuthenticationRouters from './AuthenticationRoutes.js';
import StudentRouter from './StudentRouter.js';
import ChatSocketIO from './ChatRouter.js';
import InstructorRouter from './InstrucotrRouter.js';
import NotificationRouter from './NotificationRouter.js';

function route(app){

    app.use("/student",StudentRouter);
    app.use('/chats',ChatSocketIO);
    app.use('/instructor',InstructorRouter);
    app.use('/notification',NotificationRouter);
    app.use('/',AuthenticationRouters);

}

export default route;