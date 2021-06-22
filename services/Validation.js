const { Validator } = require('node-input-validator');

const Validation = async(data, rules) => {
    const v = new Validator(data, rules)
    const matched = await v.check();

    if (!matched) {
        throw (v.errors)
    }
}

module.exports = Validation