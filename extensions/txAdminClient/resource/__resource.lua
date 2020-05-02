resource_manifest_version '44febabe-d386-4d18-afbe-5e627f4af937'

-- This client version helps to catch information from the FXServer. (Created by Tabarra)
description 'Helper resource for LionPanel'
version '1.5.0'

server_scripts {
	"sv_main.lua",
	"sv_logger.js"
}

client_scripts {
	"cl_logger.js"
}
