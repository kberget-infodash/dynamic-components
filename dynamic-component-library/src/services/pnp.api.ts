/* eslint-disable no-var */
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";

import { ISPFXContext, spfi, SPFI, SPFx as spSPFx } from "@pnp/sp";
import { graphfi, GraphFI, SPFx as graphSPFx } from "@pnp/graph";
import { LogLevel, PnPLogging } from "@pnp/logging";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/batching";

let _sp: SPFI;
let _graph: GraphFI;

export const getSP = (context?: WebPartContext | ApplicationCustomizerContext, source?: string): SPFI => {
	if (_sp === undefined || _sp === null) {
		console.log("Creating new SP instance", source);
		_sp = spfi()
			.using(spSPFx(context as ISPFXContext))
			.using(PnPLogging(LogLevel.Verbose));
	} else {
		console.log("Using existing SP instance", source);
	}
	return _sp;
};

export const getGraph = (context?: WebPartContext | ApplicationCustomizerContext, source?: string): GraphFI => {
	if (_graph === undefined || _graph === null) {
		console.log("Creating new Graph instance", source);
		_graph = graphfi()
			.using(graphSPFx(context as ISPFXContext))
			.using(PnPLogging(LogLevel.Verbose));
	} else {
		console.log("Using existing Graph instance", source);
	}
	return _graph;
};
