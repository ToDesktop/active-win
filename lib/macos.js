"use strict";
const path = require("path");
const { promisify } = require("util");
const childProcess = require("child_process");

const execFile = promisify(childProcess.execFile);
const bin = path.join(__dirname, "../main");
const bin64 = path.join(__dirname, "../main64");

const parseMac = (stdout) => {
	try {
		const result = JSON.parse(stdout);
		if (result !== null) {
			result.platform = "macos";
			return result;
		}
	} catch (error) {
		console.error(error);
		throw new Error("Error parsing window data");
	}
};

const getArguments = (options) => {
	if (!options) {
		return [];
	}

	const args = [];
	if (options.screenRecordingPermission === false) {
		args.push("--no-screen-recording-permission");
	}

	return args;
};

const isM1 = () => process.arch === "arm64";

module.exports = async (options) => {
	const binary = isM1() ? bin64 : bin;
	const { stdout } = await execFile(binary, getArguments(options));
	return parseMac(stdout);
};

module.exports.sync = (options) => {
	const binary = isM1() ? bin64 : bin;
	const stdout = childProcess.execFileSync(binary, getArguments(options), {
		encoding: "utf8",
	});
	return parseMac(stdout);
};
