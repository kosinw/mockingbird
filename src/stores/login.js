import { observable, action, toJS, runInAction } from 'mobx'
import remotedev from 'mobx-remotedev'
import _ from 'lodash'
import { FormStore } from './common/form'

@remotedev
export class LoginStore extends FormStore {
    @observable form = {
        fields: {
            email: {
                value: '',
                error: null,
                rules: 'required|email'
            },
            password: {
                value: '',
                error: null,
                rules: 'required'
            }
        },
        meta: {
            submited: false,
            submitAttempts: 0,
            lastServerError: null
        }
    }

    auth = null;

    constructor(auth) {
        super();
        this.auth = auth;
    }

    @action onSubmit = () => {
        runInAction("check if form has gone through inital validaiton", () => {
            if (this.form.meta.submitAttempts === 0) {
                _.mapKeys(toJS(this.form.fields), (value, key) => {
                    this.validateField(key, value.value);
                })
            }
        })

        ++this.form.meta.submitAttempts;
        return new Promise((resolve, reject) => {
            if (this.hasErrors) {
                this.form.meta.lastServerError = "auth/validation-needs-to-be-resolved";
                reject("Validation errors need to be resolved.");
            } else {
                const { email, password } = this.form.fields;
                this.auth.signInWithEmailAndPassword(email.value, password.value)
                    .catch(err => {
                        this.form.meta.lastServerError = err.code;
                        reject(err.code);
                    })
                    .then(() => {
                        this.form.meta.submited = true;
                        resolve();
                    })
            }
        })
    }
}