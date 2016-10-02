import { SpecificConfig } from './../conf/Config';
import { UsersModel } from './../models/UsersModel';
import { Middleware } from 'protontype';
import { Config, GlobalConfig, ExpressApplication } from "protontype";
import { Strategy, StrategyOptions, ExtractJwt, VerifiedCallback } from "passport-jwt";
import * as passport from "passport";

export class JWTAuthentication {
    private passport: passport.Passport;

    constructor(application: ExpressApplication) {
        this.passport = passport;
        let userModel: UsersModel = application.getModel<UsersModel>(UsersModel.MODEL_NAME);
        let conf: SpecificConfig = Config;
        let params: StrategyOptions = {
            secretOrKey: conf.jwtSecret,
            jwtFromRequest: ExtractJwt.fromAuthHeader()
        };

        const strategy: Strategy = new Strategy(params, (payload: any, done: VerifiedCallback) => {
            userModel.getInstance().findById(payload.id)
                .then(user => {
                    if (user) {
                        return done(null, {
                            id: user.id,
                            email: user.email
                        });
                    }
                    return done(null, false);
                })
                .catch(error => done(error, null));
        });
        this.passport.use(strategy);
    }

    public getPassport(): passport.Passport {
        return this.passport;
    }

}