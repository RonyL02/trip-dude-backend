import { Request, Response } from "express";
import { BaseController } from "./base_controller";
import { IUser, UserModel } from "../models/user_model";
import { StatusCodes } from "http-status-codes";
import { genSalt, hash } from 'bcrypt'
import { sendError } from "../utils";
import { RequestWithUser } from "../types";
export class UserController extends BaseController<IUser> {
    constructor() {
        super(UserModel);
    }

    async create(request: Request, response: Response) {
        const user = request.body;
        const email = user.email;
        const password = user.password;

        if (!(email && password)) {
            return sendError(response, StatusCodes.BAD_REQUEST, 'invalid credentials');
        }

        try {
            const user = await this.model.findOne({
                email
            });

            if (user) {
                return sendError(response, StatusCodes.CONFLICT, 'user already exists');
            }
        } catch (error) {
            return sendError(response, StatusCodes.INTERNAL_SERVER_ERROR, JSON.stringify(error));
        }

        try {
            const password = await this.hashPassword(user.password);

            const newUser = {
                ...user,
                password
            };

            request.body = newUser;

            await super.create(request, response);
        } catch (error) {
            sendError(response, StatusCodes.INTERNAL_SERVER_ERROR, JSON.stringify(error));
        }
    }

    async find(request: Request, response: Response) {
        const { query } = request;
        try {
            const users = await this.model.find(query as object).lean();
            const usersWithoutPassword = users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);

            response.send(usersWithoutPassword);
        } catch (error) {
            sendError(response, StatusCodes.INTERNAL_SERVER_ERROR, JSON.stringify(error));
        }
    }

    async findById(request: RequestWithUser, response: Response) {
        const id = request.params.id;

        try {
            const user = await this.model.findById(id).lean();
            if (user) {
                const { password, ...userWithoutPassword } = user;
                response.send(userWithoutPassword);
            } else {
                response.status(StatusCodes.NOT_FOUND).send();
            }
        } catch (error) {
            sendError(response, StatusCodes.INTERNAL_SERVER_ERROR, JSON.stringify(error));
        }
    }

    async update(request: RequestWithUser, response: Response) {
        request.params.id = request.user!._id;

        const body = request.body;

        if (body.password) {
            body.password = await this.hashPassword(body.password);
        }

        await super.update(request, response);
    }

    async delete(request: RequestWithUser, response: Response) {
        request.params.id = request.user!._id;

        await super.delete(request, response);
    }

    private async hashPassword(password: string) {
        const salt = await genSalt(10);
        const hashedPassword = await hash(password, salt);
        return hashedPassword;
    }
}