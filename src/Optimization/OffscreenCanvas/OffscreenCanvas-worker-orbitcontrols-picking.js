import {EventDispatcher} from "three";
import init from "./shared-orbitcontrols-picking.js";

function noop() {

}

class ElementProxyReceiver extends EventDispatcher {
    constructor() {
        super();
        this.style = {};
    }

    get clientWidth() {
        return this.width;
    }

    get clientHeight() {
        return this.height;
    }

    setPointerCapture() {
    }

    releasePointerCapture() {
    }

    getBoundingClientRect() {
        return {
            left: this.left,
            top: this.top,
            width: this.width,
            height: this.height,
            right: this.left + this.width,
            bottom: this.top + this.height,
        }
    }

    getRootNode() {
        return this; // OrbitControls가 기대하는 구조
    }

    handleEvent(data) {
        if (data.type === 'size') {
            this.left = data.left;
            this.top = data.top;
            this.width = data.width;
            this.height = data.height;
            return;
        }

        data.preventDefault = noop;
        data.stopPropagation = noop;
        this.dispatchEvent(data);
    }

    focus() {
        // no-option
    }
}

class ProxyManager {
    constructor() {
        this.targets = {};
        this.handleEvent = this.handleEvent.bind(this);
    }

    makeProxy(data) {
        const {id} = data;
        const proxy = new ElementProxyReceiver();
        this.targets[id] = proxy;
    }

    getProxy(id) {
        return this.targets[id];
    }

    handleEvent(data) {
        this.targets[data.id].handleEvent(data.data);
    }
}

const proxyManager = new ProxyManager();

function start(data) {
    const proxy = proxyManager.getProxy(data.canvasId);
    proxy.ownerDocument = proxy;
    self.document = {};
    init({
        canvas: data.canvas,
        inputElement: proxy,
    });
}

function makeProxy(data) {
    proxyManager.makeProxy(data);
}

const handlers = {
    start,
    makeProxy,
    event: proxyManager.handleEvent,
};

self.onmessage = function (e) {
    const fn = handlers[e.data.type];
    if (typeof fn !== 'function') {
        throw new Error("no handler for type:" + e.data.type);
    }
    fn(e.data);
}