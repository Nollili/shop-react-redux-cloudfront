"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
async function main(event) {
    return {
        message: `SUCCESS with message ${event.message} 🎉`
    };
}
