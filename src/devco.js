

module.exports = class Devco {
    constructor(dom) {
        this.dom = dom
        this.version = '0.0.1'
    }

    create(options) {
        this.options = options



        console.log(process.cwd())
        console.log(process.env.HOME)

        var framework = {
            options: options,
            version: '0.0.1'
        }
        return framework
    }
}