#!/usr/bin/env node
import { createRequire as __cjsCreateRequire } from 'node:module';
const require = __cjsCreateRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/yaml/dist/nodes/identity.js
var require_identity = __commonJS({
  "node_modules/yaml/dist/nodes/identity.js"(exports) {
    "use strict";
    var ALIAS = /* @__PURE__ */ Symbol.for("yaml.alias");
    var DOC = /* @__PURE__ */ Symbol.for("yaml.document");
    var MAP = /* @__PURE__ */ Symbol.for("yaml.map");
    var PAIR = /* @__PURE__ */ Symbol.for("yaml.pair");
    var SCALAR = /* @__PURE__ */ Symbol.for("yaml.scalar");
    var SEQ = /* @__PURE__ */ Symbol.for("yaml.seq");
    var NODE_TYPE = /* @__PURE__ */ Symbol.for("yaml.node.type");
    var isAlias = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === ALIAS;
    var isDocument = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === DOC;
    var isMap = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === MAP;
    var isPair = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === PAIR;
    var isScalar = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SCALAR;
    var isSeq = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SEQ;
    function isCollection(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case MAP:
          case SEQ:
            return true;
        }
      return false;
    }
    function isNode(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case ALIAS:
          case MAP:
          case SCALAR:
          case SEQ:
            return true;
        }
      return false;
    }
    var hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;
    exports.ALIAS = ALIAS;
    exports.DOC = DOC;
    exports.MAP = MAP;
    exports.NODE_TYPE = NODE_TYPE;
    exports.PAIR = PAIR;
    exports.SCALAR = SCALAR;
    exports.SEQ = SEQ;
    exports.hasAnchor = hasAnchor;
    exports.isAlias = isAlias;
    exports.isCollection = isCollection;
    exports.isDocument = isDocument;
    exports.isMap = isMap;
    exports.isNode = isNode;
    exports.isPair = isPair;
    exports.isScalar = isScalar;
    exports.isSeq = isSeq;
  }
});

// node_modules/yaml/dist/visit.js
var require_visit = __commonJS({
  "node_modules/yaml/dist/visit.js"(exports) {
    "use strict";
    var identity = require_identity();
    var BREAK = /* @__PURE__ */ Symbol("break visit");
    var SKIP = /* @__PURE__ */ Symbol("skip children");
    var REMOVE = /* @__PURE__ */ Symbol("remove node");
    function visit(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        visit_(null, node, visitor_, Object.freeze([]));
    }
    visit.BREAK = BREAK;
    visit.SKIP = SKIP;
    visit.REMOVE = REMOVE;
    function visit_(key, node, visitor, path) {
      const ctrl = callVisitor(key, node, visitor, path);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path, ctrl);
        return visit_(key, ctrl, visitor, path);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path = Object.freeze(path.concat(node));
          for (let i = 0; i < node.items.length; ++i) {
            const ci = visit_(i, node.items[i], visitor, path);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node.items.splice(i, 1);
              i -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path = Object.freeze(path.concat(node));
          const ck = visit_("key", node.key, visitor, path);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = visit_("value", node.value, visitor, path);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    async function visitAsync(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        await visitAsync_(null, node, visitor_, Object.freeze([]));
    }
    visitAsync.BREAK = BREAK;
    visitAsync.SKIP = SKIP;
    visitAsync.REMOVE = REMOVE;
    async function visitAsync_(key, node, visitor, path) {
      const ctrl = await callVisitor(key, node, visitor, path);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path, ctrl);
        return visitAsync_(key, ctrl, visitor, path);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path = Object.freeze(path.concat(node));
          for (let i = 0; i < node.items.length; ++i) {
            const ci = await visitAsync_(i, node.items[i], visitor, path);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node.items.splice(i, 1);
              i -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path = Object.freeze(path.concat(node));
          const ck = await visitAsync_("key", node.key, visitor, path);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = await visitAsync_("value", node.value, visitor, path);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    function initVisitor(visitor) {
      if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) {
        return Object.assign({
          Alias: visitor.Node,
          Map: visitor.Node,
          Scalar: visitor.Node,
          Seq: visitor.Node
        }, visitor.Value && {
          Map: visitor.Value,
          Scalar: visitor.Value,
          Seq: visitor.Value
        }, visitor.Collection && {
          Map: visitor.Collection,
          Seq: visitor.Collection
        }, visitor);
      }
      return visitor;
    }
    function callVisitor(key, node, visitor, path) {
      if (typeof visitor === "function")
        return visitor(key, node, path);
      if (identity.isMap(node))
        return visitor.Map?.(key, node, path);
      if (identity.isSeq(node))
        return visitor.Seq?.(key, node, path);
      if (identity.isPair(node))
        return visitor.Pair?.(key, node, path);
      if (identity.isScalar(node))
        return visitor.Scalar?.(key, node, path);
      if (identity.isAlias(node))
        return visitor.Alias?.(key, node, path);
      return void 0;
    }
    function replaceNode(key, path, node) {
      const parent = path[path.length - 1];
      if (identity.isCollection(parent)) {
        parent.items[key] = node;
      } else if (identity.isPair(parent)) {
        if (key === "key")
          parent.key = node;
        else
          parent.value = node;
      } else if (identity.isDocument(parent)) {
        parent.contents = node;
      } else {
        const pt = identity.isAlias(parent) ? "alias" : "scalar";
        throw new Error(`Cannot replace node with ${pt} parent`);
      }
    }
    exports.visit = visit;
    exports.visitAsync = visitAsync;
  }
});

// node_modules/yaml/dist/doc/directives.js
var require_directives = __commonJS({
  "node_modules/yaml/dist/doc/directives.js"(exports) {
    "use strict";
    var identity = require_identity();
    var visit = require_visit();
    var escapeChars = {
      "!": "%21",
      ",": "%2C",
      "[": "%5B",
      "]": "%5D",
      "{": "%7B",
      "}": "%7D"
    };
    var escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);
    var Directives = class _Directives {
      constructor(yaml, tags) {
        this.docStart = null;
        this.docEnd = false;
        this.yaml = Object.assign({}, _Directives.defaultYaml, yaml);
        this.tags = Object.assign({}, _Directives.defaultTags, tags);
      }
      clone() {
        const copy = new _Directives(this.yaml, this.tags);
        copy.docStart = this.docStart;
        return copy;
      }
      /**
       * During parsing, get a Directives instance for the current document and
       * update the stream state according to the current version's spec.
       */
      atDocument() {
        const res = new _Directives(this.yaml, this.tags);
        switch (this.yaml.version) {
          case "1.1":
            this.atNextDocument = true;
            break;
          case "1.2":
            this.atNextDocument = false;
            this.yaml = {
              explicit: _Directives.defaultYaml.explicit,
              version: "1.2"
            };
            this.tags = Object.assign({}, _Directives.defaultTags);
            break;
        }
        return res;
      }
      /**
       * @param onError - May be called even if the action was successful
       * @returns `true` on success
       */
      add(line, onError) {
        if (this.atNextDocument) {
          this.yaml = { explicit: _Directives.defaultYaml.explicit, version: "1.1" };
          this.tags = Object.assign({}, _Directives.defaultTags);
          this.atNextDocument = false;
        }
        const parts = line.trim().split(/[ \t]+/);
        const name = parts.shift();
        switch (name) {
          case "%TAG": {
            if (parts.length !== 2) {
              onError(0, "%TAG directive should contain exactly two parts");
              if (parts.length < 2)
                return false;
            }
            const [handle, prefix] = parts;
            this.tags[handle] = prefix;
            return true;
          }
          case "%YAML": {
            this.yaml.explicit = true;
            if (parts.length !== 1) {
              onError(0, "%YAML directive should contain exactly one part");
              return false;
            }
            const [version] = parts;
            if (version === "1.1" || version === "1.2") {
              this.yaml.version = version;
              return true;
            } else {
              const isValid = /^\d+\.\d+$/.test(version);
              onError(6, `Unsupported YAML version ${version}`, isValid);
              return false;
            }
          }
          default:
            onError(0, `Unknown directive ${name}`, true);
            return false;
        }
      }
      /**
       * Resolves a tag, matching handles to those defined in %TAG directives.
       *
       * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
       *   `'!local'` tag, or `null` if unresolvable.
       */
      tagName(source, onError) {
        if (source === "!")
          return "!";
        if (source[0] !== "!") {
          onError(`Not a valid tag: ${source}`);
          return null;
        }
        if (source[1] === "<") {
          const verbatim = source.slice(2, -1);
          if (verbatim === "!" || verbatim === "!!") {
            onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
            return null;
          }
          if (source[source.length - 1] !== ">")
            onError("Verbatim tags must end with a >");
          return verbatim;
        }
        const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
        if (!suffix)
          onError(`The ${source} tag has no suffix`);
        const prefix = this.tags[handle];
        if (prefix) {
          try {
            return prefix + decodeURIComponent(suffix);
          } catch (error) {
            onError(String(error));
            return null;
          }
        }
        if (handle === "!")
          return source;
        onError(`Could not resolve tag: ${source}`);
        return null;
      }
      /**
       * Given a fully resolved tag, returns its printable string form,
       * taking into account current tag prefixes and defaults.
       */
      tagString(tag) {
        for (const [handle, prefix] of Object.entries(this.tags)) {
          if (tag.startsWith(prefix))
            return handle + escapeTagName(tag.substring(prefix.length));
        }
        return tag[0] === "!" ? tag : `!<${tag}>`;
      }
      toString(doc) {
        const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
        const tagEntries = Object.entries(this.tags);
        let tagNames;
        if (doc && tagEntries.length > 0 && identity.isNode(doc.contents)) {
          const tags = {};
          visit.visit(doc.contents, (_key, node) => {
            if (identity.isNode(node) && node.tag)
              tags[node.tag] = true;
          });
          tagNames = Object.keys(tags);
        } else
          tagNames = [];
        for (const [handle, prefix] of tagEntries) {
          if (handle === "!!" && prefix === "tag:yaml.org,2002:")
            continue;
          if (!doc || tagNames.some((tn) => tn.startsWith(prefix)))
            lines.push(`%TAG ${handle} ${prefix}`);
        }
        return lines.join("\n");
      }
    };
    Directives.defaultYaml = { explicit: false, version: "1.2" };
    Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };
    exports.Directives = Directives;
  }
});

// node_modules/yaml/dist/doc/anchors.js
var require_anchors = __commonJS({
  "node_modules/yaml/dist/doc/anchors.js"(exports) {
    "use strict";
    var identity = require_identity();
    var visit = require_visit();
    function anchorIsValid(anchor) {
      if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
        const sa = JSON.stringify(anchor);
        const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
        throw new Error(msg);
      }
      return true;
    }
    function anchorNames(root) {
      const anchors = /* @__PURE__ */ new Set();
      visit.visit(root, {
        Value(_key, node) {
          if (node.anchor)
            anchors.add(node.anchor);
        }
      });
      return anchors;
    }
    function findNewAnchor(prefix, exclude) {
      for (let i = 1; true; ++i) {
        const name = `${prefix}${i}`;
        if (!exclude.has(name))
          return name;
      }
    }
    function createNodeAnchors(doc, prefix) {
      const aliasObjects = [];
      const sourceObjects = /* @__PURE__ */ new Map();
      let prevAnchors = null;
      return {
        onAnchor: (source) => {
          aliasObjects.push(source);
          prevAnchors ?? (prevAnchors = anchorNames(doc));
          const anchor = findNewAnchor(prefix, prevAnchors);
          prevAnchors.add(anchor);
          return anchor;
        },
        /**
         * With circular references, the source node is only resolved after all
         * of its child nodes are. This is why anchors are set only after all of
         * the nodes have been created.
         */
        setAnchors: () => {
          for (const source of aliasObjects) {
            const ref = sourceObjects.get(source);
            if (typeof ref === "object" && ref.anchor && (identity.isScalar(ref.node) || identity.isCollection(ref.node))) {
              ref.node.anchor = ref.anchor;
            } else {
              const error = new Error("Failed to resolve repeated object (this should not happen)");
              error.source = source;
              throw error;
            }
          }
        },
        sourceObjects
      };
    }
    exports.anchorIsValid = anchorIsValid;
    exports.anchorNames = anchorNames;
    exports.createNodeAnchors = createNodeAnchors;
    exports.findNewAnchor = findNewAnchor;
  }
});

// node_modules/yaml/dist/doc/applyReviver.js
var require_applyReviver = __commonJS({
  "node_modules/yaml/dist/doc/applyReviver.js"(exports) {
    "use strict";
    function applyReviver(reviver, obj, key, val) {
      if (val && typeof val === "object") {
        if (Array.isArray(val)) {
          for (let i = 0, len = val.length; i < len; ++i) {
            const v0 = val[i];
            const v1 = applyReviver(reviver, val, String(i), v0);
            if (v1 === void 0)
              delete val[i];
            else if (v1 !== v0)
              val[i] = v1;
          }
        } else if (val instanceof Map) {
          for (const k of Array.from(val.keys())) {
            const v0 = val.get(k);
            const v1 = applyReviver(reviver, val, k, v0);
            if (v1 === void 0)
              val.delete(k);
            else if (v1 !== v0)
              val.set(k, v1);
          }
        } else if (val instanceof Set) {
          for (const v0 of Array.from(val)) {
            const v1 = applyReviver(reviver, val, v0, v0);
            if (v1 === void 0)
              val.delete(v0);
            else if (v1 !== v0) {
              val.delete(v0);
              val.add(v1);
            }
          }
        } else {
          for (const [k, v0] of Object.entries(val)) {
            const v1 = applyReviver(reviver, val, k, v0);
            if (v1 === void 0)
              delete val[k];
            else if (v1 !== v0)
              val[k] = v1;
          }
        }
      }
      return reviver.call(obj, key, val);
    }
    exports.applyReviver = applyReviver;
  }
});

// node_modules/yaml/dist/nodes/toJS.js
var require_toJS = __commonJS({
  "node_modules/yaml/dist/nodes/toJS.js"(exports) {
    "use strict";
    var identity = require_identity();
    function toJS(value, arg, ctx) {
      if (Array.isArray(value))
        return value.map((v, i) => toJS(v, String(i), ctx));
      if (value && typeof value.toJSON === "function") {
        if (!ctx || !identity.hasAnchor(value))
          return value.toJSON(arg, ctx);
        const data = { aliasCount: 0, count: 1, res: void 0 };
        ctx.anchors.set(value, data);
        ctx.onCreate = (res2) => {
          data.res = res2;
          delete ctx.onCreate;
        };
        const res = value.toJSON(arg, ctx);
        if (ctx.onCreate)
          ctx.onCreate(res);
        return res;
      }
      if (typeof value === "bigint" && !ctx?.keep)
        return Number(value);
      return value;
    }
    exports.toJS = toJS;
  }
});

// node_modules/yaml/dist/nodes/Node.js
var require_Node = __commonJS({
  "node_modules/yaml/dist/nodes/Node.js"(exports) {
    "use strict";
    var applyReviver = require_applyReviver();
    var identity = require_identity();
    var toJS = require_toJS();
    var NodeBase = class {
      constructor(type) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: type });
      }
      /** Create a copy of this node.  */
      clone() {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** A plain JavaScript representation of this node. */
      toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        if (!identity.isDocument(doc))
          throw new TypeError("A document argument is required");
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc,
          keep: true,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this, "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
    };
    exports.NodeBase = NodeBase;
  }
});

// node_modules/yaml/dist/nodes/Alias.js
var require_Alias = __commonJS({
  "node_modules/yaml/dist/nodes/Alias.js"(exports) {
    "use strict";
    var anchors = require_anchors();
    var visit = require_visit();
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var Alias = class extends Node.NodeBase {
      constructor(source) {
        super(identity.ALIAS);
        this.source = source;
        Object.defineProperty(this, "tag", {
          set() {
            throw new Error("Alias nodes cannot have tags");
          }
        });
      }
      /**
       * Resolve the value of this alias within `doc`, finding the last
       * instance of the `source` anchor before this node.
       */
      resolve(doc, ctx) {
        if (ctx?.maxAliasCount === 0)
          throw new ReferenceError("Alias resolution is disabled");
        let nodes;
        if (ctx?.aliasResolveCache) {
          nodes = ctx.aliasResolveCache;
        } else {
          nodes = [];
          visit.visit(doc, {
            Node: (_key, node) => {
              if (identity.isAlias(node) || identity.hasAnchor(node))
                nodes.push(node);
            }
          });
          if (ctx)
            ctx.aliasResolveCache = nodes;
        }
        let found = void 0;
        for (const node of nodes) {
          if (node === this)
            break;
          if (node.anchor === this.source)
            found = node;
        }
        return found;
      }
      toJSON(_arg, ctx) {
        if (!ctx)
          return { source: this.source };
        const { anchors: anchors2, doc, maxAliasCount } = ctx;
        const source = this.resolve(doc, ctx);
        if (!source) {
          const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
          throw new ReferenceError(msg);
        }
        let data = anchors2.get(source);
        if (!data) {
          toJS.toJS(source, null, ctx);
          data = anchors2.get(source);
        }
        if (data?.res === void 0) {
          const msg = "This should not happen: Alias anchor was not resolved?";
          throw new ReferenceError(msg);
        }
        if (maxAliasCount >= 0) {
          data.count += 1;
          if (data.aliasCount === 0)
            data.aliasCount = getAliasCount(doc, source, anchors2);
          if (data.count * data.aliasCount > maxAliasCount) {
            const msg = "Excessive alias count indicates a resource exhaustion attack";
            throw new ReferenceError(msg);
          }
        }
        return data.res;
      }
      toString(ctx, _onComment, _onChompKeep) {
        const src = `*${this.source}`;
        if (ctx) {
          anchors.anchorIsValid(this.source);
          if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
            const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
            throw new Error(msg);
          }
          if (ctx.implicitKey)
            return `${src} `;
        }
        return src;
      }
    };
    function getAliasCount(doc, node, anchors2) {
      if (identity.isAlias(node)) {
        const source = node.resolve(doc);
        const anchor = anchors2 && source && anchors2.get(source);
        return anchor ? anchor.count * anchor.aliasCount : 0;
      } else if (identity.isCollection(node)) {
        let count = 0;
        for (const item of node.items) {
          const c = getAliasCount(doc, item, anchors2);
          if (c > count)
            count = c;
        }
        return count;
      } else if (identity.isPair(node)) {
        const kc = getAliasCount(doc, node.key, anchors2);
        const vc = getAliasCount(doc, node.value, anchors2);
        return Math.max(kc, vc);
      }
      return 1;
    }
    exports.Alias = Alias;
  }
});

// node_modules/yaml/dist/nodes/Scalar.js
var require_Scalar = __commonJS({
  "node_modules/yaml/dist/nodes/Scalar.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var isScalarValue = (value) => !value || typeof value !== "function" && typeof value !== "object";
    var Scalar = class extends Node.NodeBase {
      constructor(value) {
        super(identity.SCALAR);
        this.value = value;
      }
      toJSON(arg, ctx) {
        return ctx?.keep ? this.value : toJS.toJS(this.value, arg, ctx);
      }
      toString() {
        return String(this.value);
      }
    };
    Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
    Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
    Scalar.PLAIN = "PLAIN";
    Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
    Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";
    exports.Scalar = Scalar;
    exports.isScalarValue = isScalarValue;
  }
});

// node_modules/yaml/dist/doc/createNode.js
var require_createNode = __commonJS({
  "node_modules/yaml/dist/doc/createNode.js"(exports) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var defaultTagPrefix = "tag:yaml.org,2002:";
    function findTagObject(value, tagName, tags) {
      if (tagName) {
        const match = tags.filter((t) => t.tag === tagName);
        const tagObj = match.find((t) => !t.format) ?? match[0];
        if (!tagObj)
          throw new Error(`Tag ${tagName} not found`);
        return tagObj;
      }
      return tags.find((t) => t.identify?.(value) && !t.format);
    }
    function createNode(value, tagName, ctx) {
      if (identity.isDocument(value))
        value = value.contents;
      if (identity.isNode(value))
        return value;
      if (identity.isPair(value)) {
        const map = ctx.schema[identity.MAP].createNode?.(ctx.schema, null, ctx);
        map.items.push(value);
        return map;
      }
      if (value instanceof String || value instanceof Number || value instanceof Boolean || typeof BigInt !== "undefined" && value instanceof BigInt) {
        value = value.valueOf();
      }
      const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
      let ref = void 0;
      if (aliasDuplicateObjects && value && typeof value === "object") {
        ref = sourceObjects.get(value);
        if (ref) {
          ref.anchor ?? (ref.anchor = onAnchor(value));
          return new Alias.Alias(ref.anchor);
        } else {
          ref = { anchor: null, node: null };
          sourceObjects.set(value, ref);
        }
      }
      if (tagName?.startsWith("!!"))
        tagName = defaultTagPrefix + tagName.slice(2);
      let tagObj = findTagObject(value, tagName, schema.tags);
      if (!tagObj) {
        if (value && typeof value.toJSON === "function") {
          value = value.toJSON();
        }
        if (!value || typeof value !== "object") {
          const node2 = new Scalar.Scalar(value);
          if (ref)
            ref.node = node2;
          return node2;
        }
        tagObj = value instanceof Map ? schema[identity.MAP] : Symbol.iterator in Object(value) ? schema[identity.SEQ] : schema[identity.MAP];
      }
      if (onTagObj) {
        onTagObj(tagObj);
        delete ctx.onTagObj;
      }
      const node = tagObj?.createNode ? tagObj.createNode(ctx.schema, value, ctx) : typeof tagObj?.nodeClass?.from === "function" ? tagObj.nodeClass.from(ctx.schema, value, ctx) : new Scalar.Scalar(value);
      if (tagName)
        node.tag = tagName;
      else if (!tagObj.default)
        node.tag = tagObj.tag;
      if (ref)
        ref.node = node;
      return node;
    }
    exports.createNode = createNode;
  }
});

// node_modules/yaml/dist/nodes/Collection.js
var require_Collection = __commonJS({
  "node_modules/yaml/dist/nodes/Collection.js"(exports) {
    "use strict";
    var createNode = require_createNode();
    var identity = require_identity();
    var Node = require_Node();
    function collectionFromPath(schema, path, value) {
      let v = value;
      for (let i = path.length - 1; i >= 0; --i) {
        const k = path[i];
        if (typeof k === "number" && Number.isInteger(k) && k >= 0) {
          const a = [];
          a[k] = v;
          v = a;
        } else {
          v = /* @__PURE__ */ new Map([[k, v]]);
        }
      }
      return createNode.createNode(v, void 0, {
        aliasDuplicateObjects: false,
        keepUndefined: false,
        onAnchor: () => {
          throw new Error("This should not happen, please report a bug.");
        },
        schema,
        sourceObjects: /* @__PURE__ */ new Map()
      });
    }
    var isEmptyPath = (path) => path == null || typeof path === "object" && !!path[Symbol.iterator]().next().done;
    var Collection = class extends Node.NodeBase {
      constructor(type, schema) {
        super(type);
        Object.defineProperty(this, "schema", {
          value: schema,
          configurable: true,
          enumerable: false,
          writable: true
        });
      }
      /**
       * Create a copy of this collection.
       *
       * @param schema - If defined, overwrites the original's schema
       */
      clone(schema) {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (schema)
          copy.schema = schema;
        copy.items = copy.items.map((it) => identity.isNode(it) || identity.isPair(it) ? it.clone(schema) : it);
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /**
       * Adds a value to the collection. For `!!map` and `!!omap` the value must
       * be a Pair instance or a `{ key, value }` object, which may not have a key
       * that already exists in the map.
       */
      addIn(path, value) {
        if (isEmptyPath(path))
          this.add(value);
        else {
          const [key, ...rest] = path;
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.addIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
      /**
       * Removes a value from the collection.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
          return this.delete(key);
        const node = this.get(key, true);
        if (identity.isCollection(node))
          return node.deleteIn(rest);
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path, keepScalar) {
        const [key, ...rest] = path;
        const node = this.get(key, true);
        if (rest.length === 0)
          return !keepScalar && identity.isScalar(node) ? node.value : node;
        else
          return identity.isCollection(node) ? node.getIn(rest, keepScalar) : void 0;
      }
      hasAllNullValues(allowScalar) {
        return this.items.every((node) => {
          if (!identity.isPair(node))
            return false;
          const n = node.value;
          return n == null || allowScalar && identity.isScalar(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
        });
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       */
      hasIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
          return this.has(key);
        const node = this.get(key, true);
        return identity.isCollection(node) ? node.hasIn(rest) : false;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path, value) {
        const [key, ...rest] = path;
        if (rest.length === 0) {
          this.set(key, value);
        } else {
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.setIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
    };
    exports.Collection = Collection;
    exports.collectionFromPath = collectionFromPath;
    exports.isEmptyPath = isEmptyPath;
  }
});

// node_modules/yaml/dist/stringify/stringifyComment.js
var require_stringifyComment = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyComment.js"(exports) {
    "use strict";
    var stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, "#");
    function indentComment(comment, indent) {
      if (/^\n+$/.test(comment))
        return comment.substring(1);
      return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
    }
    var lineComment = (str, indent, comment) => str.endsWith("\n") ? indentComment(comment, indent) : comment.includes("\n") ? "\n" + indentComment(comment, indent) : (str.endsWith(" ") ? "" : " ") + comment;
    exports.indentComment = indentComment;
    exports.lineComment = lineComment;
    exports.stringifyComment = stringifyComment;
  }
});

// node_modules/yaml/dist/stringify/foldFlowLines.js
var require_foldFlowLines = __commonJS({
  "node_modules/yaml/dist/stringify/foldFlowLines.js"(exports) {
    "use strict";
    var FOLD_FLOW = "flow";
    var FOLD_BLOCK = "block";
    var FOLD_QUOTED = "quoted";
    function foldFlowLines(text, indent, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
      if (!lineWidth || lineWidth < 0)
        return text;
      if (lineWidth < minContentWidth)
        minContentWidth = 0;
      const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
      if (text.length <= endStep)
        return text;
      const folds = [];
      const escapedFolds = {};
      let end = lineWidth - indent.length;
      if (typeof indentAtStart === "number") {
        if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
          folds.push(0);
        else
          end = lineWidth - indentAtStart;
      }
      let split = void 0;
      let prev = void 0;
      let overflow = false;
      let i = -1;
      let escStart = -1;
      let escEnd = -1;
      if (mode === FOLD_BLOCK) {
        i = consumeMoreIndentedLines(text, i, indent.length);
        if (i !== -1)
          end = i + endStep;
      }
      for (let ch; ch = text[i += 1]; ) {
        if (mode === FOLD_QUOTED && ch === "\\") {
          escStart = i;
          switch (text[i + 1]) {
            case "x":
              i += 3;
              break;
            case "u":
              i += 5;
              break;
            case "U":
              i += 9;
              break;
            default:
              i += 1;
          }
          escEnd = i;
        }
        if (ch === "\n") {
          if (mode === FOLD_BLOCK)
            i = consumeMoreIndentedLines(text, i, indent.length);
          end = i + indent.length + endStep;
          split = void 0;
        } else {
          if (ch === " " && prev && prev !== " " && prev !== "\n" && prev !== "	") {
            const next = text[i + 1];
            if (next && next !== " " && next !== "\n" && next !== "	")
              split = i;
          }
          if (i >= end) {
            if (split) {
              folds.push(split);
              end = split + endStep;
              split = void 0;
            } else if (mode === FOLD_QUOTED) {
              while (prev === " " || prev === "	") {
                prev = ch;
                ch = text[i += 1];
                overflow = true;
              }
              const j = i > escEnd + 1 ? i - 2 : escStart - 1;
              if (escapedFolds[j])
                return text;
              folds.push(j);
              escapedFolds[j] = true;
              end = j + endStep;
              split = void 0;
            } else {
              overflow = true;
            }
          }
        }
        prev = ch;
      }
      if (overflow && onOverflow)
        onOverflow();
      if (folds.length === 0)
        return text;
      if (onFold)
        onFold();
      let res = text.slice(0, folds[0]);
      for (let i2 = 0; i2 < folds.length; ++i2) {
        const fold = folds[i2];
        const end2 = folds[i2 + 1] || text.length;
        if (fold === 0)
          res = `
${indent}${text.slice(0, end2)}`;
        else {
          if (mode === FOLD_QUOTED && escapedFolds[fold])
            res += `${text[fold]}\\`;
          res += `
${indent}${text.slice(fold + 1, end2)}`;
        }
      }
      return res;
    }
    function consumeMoreIndentedLines(text, i, indent) {
      let end = i;
      let start = i + 1;
      let ch = text[start];
      while (ch === " " || ch === "	") {
        if (i < start + indent) {
          ch = text[++i];
        } else {
          do {
            ch = text[++i];
          } while (ch && ch !== "\n");
          end = i;
          start = i + 1;
          ch = text[start];
        }
      }
      return end;
    }
    exports.FOLD_BLOCK = FOLD_BLOCK;
    exports.FOLD_FLOW = FOLD_FLOW;
    exports.FOLD_QUOTED = FOLD_QUOTED;
    exports.foldFlowLines = foldFlowLines;
  }
});

// node_modules/yaml/dist/stringify/stringifyString.js
var require_stringifyString = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyString.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var foldFlowLines = require_foldFlowLines();
    var getFoldOptions = (ctx, isBlock) => ({
      indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
      lineWidth: ctx.options.lineWidth,
      minContentWidth: ctx.options.minContentWidth
    });
    var containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
    function lineLengthOverLimit(str, lineWidth, indentLength) {
      if (!lineWidth || lineWidth < 0)
        return false;
      const limit = lineWidth - indentLength;
      const strLen = str.length;
      if (strLen <= limit)
        return false;
      for (let i = 0, start = 0; i < strLen; ++i) {
        if (str[i] === "\n") {
          if (i - start > limit)
            return true;
          start = i + 1;
          if (strLen - start <= limit)
            return false;
        }
      }
      return true;
    }
    function doubleQuotedString(value, ctx) {
      const json = JSON.stringify(value);
      if (ctx.options.doubleQuotedAsJSON)
        return json;
      const { implicitKey } = ctx;
      const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      let str = "";
      let start = 0;
      for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
        if (ch === " " && json[i + 1] === "\\" && json[i + 2] === "n") {
          str += json.slice(start, i) + "\\ ";
          i += 1;
          start = i;
          ch = "\\";
        }
        if (ch === "\\")
          switch (json[i + 1]) {
            case "u":
              {
                str += json.slice(start, i);
                const code = json.substr(i + 2, 4);
                switch (code) {
                  case "0000":
                    str += "\\0";
                    break;
                  case "0007":
                    str += "\\a";
                    break;
                  case "000b":
                    str += "\\v";
                    break;
                  case "001b":
                    str += "\\e";
                    break;
                  case "0085":
                    str += "\\N";
                    break;
                  case "00a0":
                    str += "\\_";
                    break;
                  case "2028":
                    str += "\\L";
                    break;
                  case "2029":
                    str += "\\P";
                    break;
                  default:
                    if (code.substr(0, 2) === "00")
                      str += "\\x" + code.substr(2);
                    else
                      str += json.substr(i, 6);
                }
                i += 5;
                start = i + 1;
              }
              break;
            case "n":
              if (implicitKey || json[i + 2] === '"' || json.length < minMultiLineLength) {
                i += 1;
              } else {
                str += json.slice(start, i) + "\n\n";
                while (json[i + 2] === "\\" && json[i + 3] === "n" && json[i + 4] !== '"') {
                  str += "\n";
                  i += 2;
                }
                str += indent;
                if (json[i + 2] === " ")
                  str += "\\";
                i += 1;
                start = i + 1;
              }
              break;
            default:
              i += 1;
          }
      }
      str = start ? str + json.slice(start) : json;
      return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_QUOTED, getFoldOptions(ctx, false));
    }
    function singleQuotedString(value, ctx) {
      if (ctx.options.singleQuote === false || ctx.implicitKey && value.includes("\n") || /[ \t]\n|\n[ \t]/.test(value))
        return doubleQuotedString(value, ctx);
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&
${indent}`) + "'";
      return ctx.implicitKey ? res : foldFlowLines.foldFlowLines(res, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function quotedString(value, ctx) {
      const { singleQuote } = ctx.options;
      let qs;
      if (singleQuote === false)
        qs = doubleQuotedString;
      else {
        const hasDouble = value.includes('"');
        const hasSingle = value.includes("'");
        if (hasDouble && !hasSingle)
          qs = singleQuotedString;
        else if (hasSingle && !hasDouble)
          qs = doubleQuotedString;
        else
          qs = singleQuote ? singleQuotedString : doubleQuotedString;
      }
      return qs(value, ctx);
    }
    var blockEndNewlines;
    try {
      blockEndNewlines = new RegExp("(^|(?<!\n))\n+(?!\n|$)", "g");
    } catch {
      blockEndNewlines = /\n+(?!\n|$)/g;
    }
    function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
      const { blockQuote, commentString, lineWidth } = ctx.options;
      if (!blockQuote || /\n[\t ]+$/.test(value)) {
        return quotedString(value, ctx);
      }
      const indent = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
      const literal = blockQuote === "literal" ? true : blockQuote === "folded" || type === Scalar.Scalar.BLOCK_FOLDED ? false : type === Scalar.Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, lineWidth, indent.length);
      if (!value)
        return literal ? "|\n" : ">\n";
      let chomp;
      let endStart;
      for (endStart = value.length; endStart > 0; --endStart) {
        const ch = value[endStart - 1];
        if (ch !== "\n" && ch !== "	" && ch !== " ")
          break;
      }
      let end = value.substring(endStart);
      const endNlPos = end.indexOf("\n");
      if (endNlPos === -1) {
        chomp = "-";
      } else if (value === end || endNlPos !== end.length - 1) {
        chomp = "+";
        if (onChompKeep)
          onChompKeep();
      } else {
        chomp = "";
      }
      if (end) {
        value = value.slice(0, -end.length);
        if (end[end.length - 1] === "\n")
          end = end.slice(0, -1);
        end = end.replace(blockEndNewlines, `$&${indent}`);
      }
      let startWithSpace = false;
      let startEnd;
      let startNlPos = -1;
      for (startEnd = 0; startEnd < value.length; ++startEnd) {
        const ch = value[startEnd];
        if (ch === " ")
          startWithSpace = true;
        else if (ch === "\n")
          startNlPos = startEnd;
        else
          break;
      }
      let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
      if (start) {
        value = value.substring(start.length);
        start = start.replace(/\n+/g, `$&${indent}`);
      }
      const indentSize = indent ? "2" : "1";
      let header = (startWithSpace ? indentSize : "") + chomp;
      if (comment) {
        header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
        if (onComment)
          onComment();
      }
      if (!literal) {
        const foldedValue = value.replace(/\n+/g, "\n$&").replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent}`);
        let literalFallback = false;
        const foldOptions = getFoldOptions(ctx, true);
        if (blockQuote !== "folded" && type !== Scalar.Scalar.BLOCK_FOLDED) {
          foldOptions.onOverflow = () => {
            literalFallback = true;
          };
        }
        const body = foldFlowLines.foldFlowLines(`${start}${foldedValue}${end}`, indent, foldFlowLines.FOLD_BLOCK, foldOptions);
        if (!literalFallback)
          return `>${header}
${indent}${body}`;
      }
      value = value.replace(/\n+/g, `$&${indent}`);
      return `|${header}
${indent}${start}${value}${end}`;
    }
    function plainString(item, ctx, onComment, onChompKeep) {
      const { type, value } = item;
      const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
      if (implicitKey && value.includes("\n") || inFlow && /[[\]{},]/.test(value)) {
        return quotedString(value, ctx);
      }
      if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
        return implicitKey || inFlow || !value.includes("\n") ? quotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
      }
      if (!implicitKey && !inFlow && type !== Scalar.Scalar.PLAIN && value.includes("\n")) {
        return blockString(item, ctx, onComment, onChompKeep);
      }
      if (containsDocumentMarker(value)) {
        if (indent === "") {
          ctx.forceBlockIndent = true;
          return blockString(item, ctx, onComment, onChompKeep);
        } else if (implicitKey && indent === indentStep) {
          return quotedString(value, ctx);
        }
      }
      const str = value.replace(/\n+/g, `$&
${indent}`);
      if (actualString) {
        const test = (tag) => tag.default && tag.tag !== "tag:yaml.org,2002:str" && tag.test?.test(str);
        const { compat, tags } = ctx.doc.schema;
        if (tags.some(test) || compat?.some(test))
          return quotedString(value, ctx);
      }
      return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function stringifyString(item, ctx, onComment, onChompKeep) {
      const { implicitKey, inFlow } = ctx;
      const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
      let { type } = item;
      if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
        if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
          type = Scalar.Scalar.QUOTE_DOUBLE;
      }
      const _stringify = (_type) => {
        switch (_type) {
          case Scalar.Scalar.BLOCK_FOLDED:
          case Scalar.Scalar.BLOCK_LITERAL:
            return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
          case Scalar.Scalar.QUOTE_DOUBLE:
            return doubleQuotedString(ss.value, ctx);
          case Scalar.Scalar.QUOTE_SINGLE:
            return singleQuotedString(ss.value, ctx);
          case Scalar.Scalar.PLAIN:
            return plainString(ss, ctx, onComment, onChompKeep);
          default:
            return null;
        }
      };
      let res = _stringify(type);
      if (res === null) {
        const { defaultKeyType, defaultStringType } = ctx.options;
        const t = implicitKey && defaultKeyType || defaultStringType;
        res = _stringify(t);
        if (res === null)
          throw new Error(`Unsupported default string type ${t}`);
      }
      return res;
    }
    exports.stringifyString = stringifyString;
  }
});

// node_modules/yaml/dist/stringify/stringify.js
var require_stringify = __commonJS({
  "node_modules/yaml/dist/stringify/stringify.js"(exports) {
    "use strict";
    var anchors = require_anchors();
    var identity = require_identity();
    var stringifyComment = require_stringifyComment();
    var stringifyString = require_stringifyString();
    function createStringifyContext(doc, options) {
      const opt = Object.assign({
        blockQuote: true,
        commentString: stringifyComment.stringifyComment,
        defaultKeyType: null,
        defaultStringType: "PLAIN",
        directives: null,
        doubleQuotedAsJSON: false,
        doubleQuotedMinMultiLineLength: 40,
        falseStr: "false",
        flowCollectionPadding: true,
        indentSeq: true,
        lineWidth: 80,
        minContentWidth: 20,
        nullStr: "null",
        simpleKeys: false,
        singleQuote: null,
        trailingComma: false,
        trueStr: "true",
        verifyAliasOrder: true
      }, doc.schema.toStringOptions, options);
      let inFlow;
      switch (opt.collectionStyle) {
        case "block":
          inFlow = false;
          break;
        case "flow":
          inFlow = true;
          break;
        default:
          inFlow = null;
      }
      return {
        anchors: /* @__PURE__ */ new Set(),
        doc,
        flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
        indent: "",
        indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
        inFlow,
        options: opt
      };
    }
    function getTagObject(tags, item) {
      if (item.tag) {
        const match = tags.filter((t) => t.tag === item.tag);
        if (match.length > 0)
          return match.find((t) => t.format === item.format) ?? match[0];
      }
      let tagObj = void 0;
      let obj;
      if (identity.isScalar(item)) {
        obj = item.value;
        let match = tags.filter((t) => t.identify?.(obj));
        if (match.length > 1) {
          const testMatch = match.filter((t) => t.test);
          if (testMatch.length > 0)
            match = testMatch;
        }
        tagObj = match.find((t) => t.format === item.format) ?? match.find((t) => !t.format);
      } else {
        obj = item;
        tagObj = tags.find((t) => t.nodeClass && obj instanceof t.nodeClass);
      }
      if (!tagObj) {
        const name = obj?.constructor?.name ?? (obj === null ? "null" : typeof obj);
        throw new Error(`Tag not resolved for ${name} value`);
      }
      return tagObj;
    }
    function stringifyProps(node, tagObj, { anchors: anchors$1, doc }) {
      if (!doc.directives)
        return "";
      const props = [];
      const anchor = (identity.isScalar(node) || identity.isCollection(node)) && node.anchor;
      if (anchor && anchors.anchorIsValid(anchor)) {
        anchors$1.add(anchor);
        props.push(`&${anchor}`);
      }
      const tag = node.tag ?? (tagObj.default ? null : tagObj.tag);
      if (tag)
        props.push(doc.directives.tagString(tag));
      return props.join(" ");
    }
    function stringify(item, ctx, onComment, onChompKeep) {
      if (identity.isPair(item))
        return item.toString(ctx, onComment, onChompKeep);
      if (identity.isAlias(item)) {
        if (ctx.doc.directives)
          return item.toString(ctx);
        if (ctx.resolvedAliases?.has(item)) {
          throw new TypeError(`Cannot stringify circular structure without alias nodes`);
        } else {
          if (ctx.resolvedAliases)
            ctx.resolvedAliases.add(item);
          else
            ctx.resolvedAliases = /* @__PURE__ */ new Set([item]);
          item = item.resolve(ctx.doc);
        }
      }
      let tagObj = void 0;
      const node = identity.isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => tagObj = o });
      tagObj ?? (tagObj = getTagObject(ctx.doc.schema.tags, node));
      const props = stringifyProps(node, tagObj, ctx);
      if (props.length > 0)
        ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
      const str = typeof tagObj.stringify === "function" ? tagObj.stringify(node, ctx, onComment, onChompKeep) : identity.isScalar(node) ? stringifyString.stringifyString(node, ctx, onComment, onChompKeep) : node.toString(ctx, onComment, onChompKeep);
      if (!props)
        return str;
      return identity.isScalar(node) || str[0] === "{" || str[0] === "[" ? `${props} ${str}` : `${props}
${ctx.indent}${str}`;
    }
    exports.createStringifyContext = createStringifyContext;
    exports.stringify = stringify;
  }
});

// node_modules/yaml/dist/stringify/stringifyPair.js
var require_stringifyPair = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyPair.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
      const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
      let keyComment = identity.isNode(key) && key.comment || null;
      if (simpleKeys) {
        if (keyComment) {
          throw new Error("With simple keys, key nodes cannot have comments");
        }
        if (identity.isCollection(key) || !identity.isNode(key) && typeof key === "object") {
          const msg = "With simple keys, collection cannot be used as a key value";
          throw new Error(msg);
        }
      }
      let explicitKey = !simpleKeys && (!key || keyComment && value == null && !ctx.inFlow || identity.isCollection(key) || (identity.isScalar(key) ? key.type === Scalar.Scalar.BLOCK_FOLDED || key.type === Scalar.Scalar.BLOCK_LITERAL : typeof key === "object"));
      ctx = Object.assign({}, ctx, {
        allNullValues: false,
        implicitKey: !explicitKey && (simpleKeys || !allNullValues),
        indent: indent + indentStep
      });
      let keyCommentDone = false;
      let chompKeep = false;
      let str = stringify.stringify(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
      if (!explicitKey && !ctx.inFlow && str.length > 1024) {
        if (simpleKeys)
          throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
        explicitKey = true;
      }
      if (ctx.inFlow) {
        if (allNullValues || value == null) {
          if (keyCommentDone && onComment)
            onComment();
          return str === "" ? "?" : explicitKey ? `? ${str}` : str;
        }
      } else if (allNullValues && !simpleKeys || value == null && explicitKey) {
        str = `? ${str}`;
        if (keyComment && !keyCommentDone) {
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
        } else if (chompKeep && onChompKeep)
          onChompKeep();
        return str;
      }
      if (keyCommentDone)
        keyComment = null;
      if (explicitKey) {
        if (keyComment)
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
        str = `? ${str}
${indent}:`;
      } else {
        str = `${str}:`;
        if (keyComment)
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
      }
      let vsb, vcb, valueComment;
      if (identity.isNode(value)) {
        vsb = !!value.spaceBefore;
        vcb = value.commentBefore;
        valueComment = value.comment;
      } else {
        vsb = false;
        vcb = null;
        valueComment = null;
        if (value && typeof value === "object")
          value = doc.createNode(value);
      }
      ctx.implicitKey = false;
      if (!explicitKey && !keyComment && identity.isScalar(value))
        ctx.indentAtStart = str.length + 1;
      chompKeep = false;
      if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && identity.isSeq(value) && !value.flow && !value.tag && !value.anchor) {
        ctx.indent = ctx.indent.substring(2);
      }
      let valueCommentDone = false;
      const valueStr = stringify.stringify(value, ctx, () => valueCommentDone = true, () => chompKeep = true);
      let ws = " ";
      if (keyComment || vsb || vcb) {
        ws = vsb ? "\n" : "";
        if (vcb) {
          const cs = commentString(vcb);
          ws += `
${stringifyComment.indentComment(cs, ctx.indent)}`;
        }
        if (valueStr === "" && !ctx.inFlow) {
          if (ws === "\n" && valueComment)
            ws = "\n\n";
        } else {
          ws += `
${ctx.indent}`;
        }
      } else if (!explicitKey && identity.isCollection(value)) {
        const vs0 = valueStr[0];
        const nl0 = valueStr.indexOf("\n");
        const hasNewline = nl0 !== -1;
        const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
        if (hasNewline || !flow) {
          let hasPropsLine = false;
          if (hasNewline && (vs0 === "&" || vs0 === "!")) {
            let sp0 = valueStr.indexOf(" ");
            if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") {
              sp0 = valueStr.indexOf(" ", sp0 + 1);
            }
            if (sp0 === -1 || nl0 < sp0)
              hasPropsLine = true;
          }
          if (!hasPropsLine)
            ws = `
${ctx.indent}`;
        }
      } else if (valueStr === "" || valueStr[0] === "\n") {
        ws = "";
      }
      str += ws + valueStr;
      if (ctx.inFlow) {
        if (valueCommentDone && onComment)
          onComment();
      } else if (valueComment && !valueCommentDone) {
        str += stringifyComment.lineComment(str, ctx.indent, commentString(valueComment));
      } else if (chompKeep && onChompKeep) {
        onChompKeep();
      }
      return str;
    }
    exports.stringifyPair = stringifyPair;
  }
});

// node_modules/yaml/dist/log.js
var require_log = __commonJS({
  "node_modules/yaml/dist/log.js"(exports) {
    "use strict";
    var node_process = __require("process");
    function debug(logLevel, ...messages) {
      if (logLevel === "debug")
        console.log(...messages);
    }
    function warn(logLevel, warning) {
      if (logLevel === "debug" || logLevel === "warn") {
        if (typeof node_process.emitWarning === "function")
          node_process.emitWarning(warning);
        else
          console.warn(warning);
      }
    }
    exports.debug = debug;
    exports.warn = warn;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/merge.js
var require_merge = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/merge.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var MERGE_KEY = "<<";
    var merge = {
      identify: (value) => value === MERGE_KEY || typeof value === "symbol" && value.description === MERGE_KEY,
      default: "key",
      tag: "tag:yaml.org,2002:merge",
      test: /^<<$/,
      resolve: () => Object.assign(new Scalar.Scalar(Symbol(MERGE_KEY)), {
        addToJSMap: addMergeToJSMap
      }),
      stringify: () => MERGE_KEY
    };
    var isMergeKey = (ctx, key) => (merge.identify(key) || identity.isScalar(key) && (!key.type || key.type === Scalar.Scalar.PLAIN) && merge.identify(key.value)) && ctx?.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default);
    function addMergeToJSMap(ctx, map, value) {
      const source = resolveAliasValue(ctx, value);
      if (identity.isSeq(source))
        for (const it of source.items)
          mergeValue(ctx, map, it);
      else if (Array.isArray(source))
        for (const it of source)
          mergeValue(ctx, map, it);
      else
        mergeValue(ctx, map, source);
    }
    function mergeValue(ctx, map, value) {
      const source = resolveAliasValue(ctx, value);
      if (!identity.isMap(source))
        throw new Error("Merge sources must be maps or map aliases");
      const srcMap = source.toJSON(null, ctx, Map);
      for (const [key, value2] of srcMap) {
        if (map instanceof Map) {
          if (!map.has(key))
            map.set(key, value2);
        } else if (map instanceof Set) {
          map.add(key);
        } else if (!Object.prototype.hasOwnProperty.call(map, key)) {
          Object.defineProperty(map, key, {
            value: value2,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }
      return map;
    }
    function resolveAliasValue(ctx, value) {
      return ctx && identity.isAlias(value) ? value.resolve(ctx.doc, ctx) : value;
    }
    exports.addMergeToJSMap = addMergeToJSMap;
    exports.isMergeKey = isMergeKey;
    exports.merge = merge;
  }
});

// node_modules/yaml/dist/nodes/addPairToJSMap.js
var require_addPairToJSMap = __commonJS({
  "node_modules/yaml/dist/nodes/addPairToJSMap.js"(exports) {
    "use strict";
    var log = require_log();
    var merge = require_merge();
    var stringify = require_stringify();
    var identity = require_identity();
    var toJS = require_toJS();
    function addPairToJSMap(ctx, map, { key, value }) {
      if (identity.isNode(key) && key.addToJSMap)
        key.addToJSMap(ctx, map, value);
      else if (merge.isMergeKey(ctx, key))
        merge.addMergeToJSMap(ctx, map, value);
      else {
        const jsKey = toJS.toJS(key, "", ctx);
        if (map instanceof Map) {
          map.set(jsKey, toJS.toJS(value, jsKey, ctx));
        } else if (map instanceof Set) {
          map.add(jsKey);
        } else {
          const stringKey = stringifyKey(key, jsKey, ctx);
          const jsValue = toJS.toJS(value, stringKey, ctx);
          if (stringKey in map)
            Object.defineProperty(map, stringKey, {
              value: jsValue,
              writable: true,
              enumerable: true,
              configurable: true
            });
          else
            map[stringKey] = jsValue;
        }
      }
      return map;
    }
    function stringifyKey(key, jsKey, ctx) {
      if (jsKey === null)
        return "";
      if (typeof jsKey !== "object")
        return String(jsKey);
      if (identity.isNode(key) && ctx?.doc) {
        const strCtx = stringify.createStringifyContext(ctx.doc, {});
        strCtx.anchors = /* @__PURE__ */ new Set();
        for (const node of ctx.anchors.keys())
          strCtx.anchors.add(node.anchor);
        strCtx.inFlow = true;
        strCtx.inStringifyKey = true;
        const strKey = key.toString(strCtx);
        if (!ctx.mapKeyWarned) {
          let jsonStr = JSON.stringify(strKey);
          if (jsonStr.length > 40)
            jsonStr = jsonStr.substring(0, 36) + '..."';
          log.warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
          ctx.mapKeyWarned = true;
        }
        return strKey;
      }
      return JSON.stringify(jsKey);
    }
    exports.addPairToJSMap = addPairToJSMap;
  }
});

// node_modules/yaml/dist/nodes/Pair.js
var require_Pair = __commonJS({
  "node_modules/yaml/dist/nodes/Pair.js"(exports) {
    "use strict";
    var createNode = require_createNode();
    var stringifyPair = require_stringifyPair();
    var addPairToJSMap = require_addPairToJSMap();
    var identity = require_identity();
    function createPair(key, value, ctx) {
      const k = createNode.createNode(key, void 0, ctx);
      const v = createNode.createNode(value, void 0, ctx);
      return new Pair(k, v);
    }
    var Pair = class _Pair {
      constructor(key, value = null) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.PAIR });
        this.key = key;
        this.value = value;
      }
      clone(schema) {
        let { key, value } = this;
        if (identity.isNode(key))
          key = key.clone(schema);
        if (identity.isNode(value))
          value = value.clone(schema);
        return new _Pair(key, value);
      }
      toJSON(_, ctx) {
        const pair = ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        return addPairToJSMap.addPairToJSMap(ctx, pair, this);
      }
      toString(ctx, onComment, onChompKeep) {
        return ctx?.doc ? stringifyPair.stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
      }
    };
    exports.Pair = Pair;
    exports.createPair = createPair;
  }
});

// node_modules/yaml/dist/stringify/stringifyCollection.js
var require_stringifyCollection = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyCollection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyCollection(collection, ctx, options) {
      const flow = ctx.inFlow ?? collection.flow;
      const stringify2 = flow ? stringifyFlowCollection : stringifyBlockCollection;
      return stringify2(collection, ctx, options);
    }
    function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
      const { indent, options: { commentString } } = ctx;
      const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
      let chompKeep = false;
      const lines = [];
      for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment2 = null;
        if (identity.isNode(item)) {
          if (!chompKeep && item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
          if (item.comment)
            comment2 = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (!chompKeep && ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
          }
        }
        chompKeep = false;
        let str2 = stringify.stringify(item, itemCtx, () => comment2 = null, () => chompKeep = true);
        if (comment2)
          str2 += stringifyComment.lineComment(str2, itemIndent, commentString(comment2));
        if (chompKeep && comment2)
          chompKeep = false;
        lines.push(blockItemPrefix + str2);
      }
      let str;
      if (lines.length === 0) {
        str = flowChars.start + flowChars.end;
      } else {
        str = lines[0];
        for (let i = 1; i < lines.length; ++i) {
          const line = lines[i];
          str += line ? `
${indent}${line}` : "\n";
        }
      }
      if (comment) {
        str += "\n" + stringifyComment.indentComment(commentString(comment), indent);
        if (onComment)
          onComment();
      } else if (chompKeep && onChompKeep)
        onChompKeep();
      return str;
    }
    function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
      const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
      itemIndent += indentStep;
      const itemCtx = Object.assign({}, ctx, {
        indent: itemIndent,
        inFlow: true,
        type: null
      });
      let reqNewline = false;
      let linesAtValue = 0;
      const lines = [];
      for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment = null;
        if (identity.isNode(item)) {
          if (item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, false);
          if (item.comment)
            comment = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, false);
            if (ik.comment)
              reqNewline = true;
          }
          const iv = identity.isNode(item.value) ? item.value : null;
          if (iv) {
            if (iv.comment)
              comment = iv.comment;
            if (iv.commentBefore)
              reqNewline = true;
          } else if (item.value == null && ik?.comment) {
            comment = ik.comment;
          }
        }
        if (comment)
          reqNewline = true;
        let str = stringify.stringify(item, itemCtx, () => comment = null);
        reqNewline || (reqNewline = lines.length > linesAtValue || str.includes("\n"));
        if (i < items.length - 1) {
          str += ",";
        } else if (ctx.options.trailingComma) {
          if (ctx.options.lineWidth > 0) {
            reqNewline || (reqNewline = lines.reduce((sum, line) => sum + line.length + 2, 2) + (str.length + 2) > ctx.options.lineWidth);
          }
          if (reqNewline) {
            str += ",";
          }
        }
        if (comment)
          str += stringifyComment.lineComment(str, itemIndent, commentString(comment));
        lines.push(str);
        linesAtValue = lines.length;
      }
      const { start, end } = flowChars;
      if (lines.length === 0) {
        return start + end;
      } else {
        if (!reqNewline) {
          const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
          reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
        }
        if (reqNewline) {
          let str = start;
          for (const line of lines)
            str += line ? `
${indentStep}${indent}${line}` : "\n";
          return `${str}
${indent}${end}`;
        } else {
          return `${start}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
        }
      }
    }
    function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
      if (comment && chompKeep)
        comment = comment.replace(/^\n+/, "");
      if (comment) {
        const ic = stringifyComment.indentComment(commentString(comment), indent);
        lines.push(ic.trimStart());
      }
    }
    exports.stringifyCollection = stringifyCollection;
  }
});

// node_modules/yaml/dist/nodes/YAMLMap.js
var require_YAMLMap = __commonJS({
  "node_modules/yaml/dist/nodes/YAMLMap.js"(exports) {
    "use strict";
    var stringifyCollection = require_stringifyCollection();
    var addPairToJSMap = require_addPairToJSMap();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    function findPair(items, key) {
      const k = identity.isScalar(key) ? key.value : key;
      for (const it of items) {
        if (identity.isPair(it)) {
          if (it.key === key || it.key === k)
            return it;
          if (identity.isScalar(it.key) && it.key.value === k)
            return it;
        }
      }
      return void 0;
    }
    var YAMLMap = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:map";
      }
      constructor(schema) {
        super(identity.MAP, schema);
        this.items = [];
      }
      /**
       * A generic collection parsing method that can be extended
       * to other node classes that inherit from YAMLMap
       */
      static from(schema, obj, ctx) {
        const { keepUndefined, replacer } = ctx;
        const map = new this(schema);
        const add = (key, value) => {
          if (typeof replacer === "function")
            value = replacer.call(obj, key, value);
          else if (Array.isArray(replacer) && !replacer.includes(key))
            return;
          if (value !== void 0 || keepUndefined)
            map.items.push(Pair.createPair(key, value, ctx));
        };
        if (obj instanceof Map) {
          for (const [key, value] of obj)
            add(key, value);
        } else if (obj && typeof obj === "object") {
          for (const key of Object.keys(obj))
            add(key, obj[key]);
        }
        if (typeof schema.sortMapEntries === "function") {
          map.items.sort(schema.sortMapEntries);
        }
        return map;
      }
      /**
       * Adds a value to the collection.
       *
       * @param overwrite - If not set `true`, using a key that is already in the
       *   collection will throw. Otherwise, overwrites the previous value.
       */
      add(pair, overwrite) {
        let _pair;
        if (identity.isPair(pair))
          _pair = pair;
        else if (!pair || typeof pair !== "object" || !("key" in pair)) {
          _pair = new Pair.Pair(pair, pair?.value);
        } else
          _pair = new Pair.Pair(pair.key, pair.value);
        const prev = findPair(this.items, _pair.key);
        const sortEntries = this.schema?.sortMapEntries;
        if (prev) {
          if (!overwrite)
            throw new Error(`Key ${_pair.key} already set`);
          if (identity.isScalar(prev.value) && Scalar.isScalarValue(_pair.value))
            prev.value.value = _pair.value;
          else
            prev.value = _pair.value;
        } else if (sortEntries) {
          const i = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
          if (i === -1)
            this.items.push(_pair);
          else
            this.items.splice(i, 0, _pair);
        } else {
          this.items.push(_pair);
        }
      }
      delete(key) {
        const it = findPair(this.items, key);
        if (!it)
          return false;
        const del = this.items.splice(this.items.indexOf(it), 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const it = findPair(this.items, key);
        const node = it?.value;
        return (!keepScalar && identity.isScalar(node) ? node.value : node) ?? void 0;
      }
      has(key) {
        return !!findPair(this.items, key);
      }
      set(key, value) {
        this.add(new Pair.Pair(key, value), true);
      }
      /**
       * @param ctx - Conversion context, originally set in Document#toJS()
       * @param {Class} Type - If set, forces the returned collection type
       * @returns Instance of Type, Map, or Object
       */
      toJSON(_, ctx, Type) {
        const map = Type ? new Type() : ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const item of this.items)
          addPairToJSMap.addPairToJSMap(ctx, map, item);
        return map;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        for (const item of this.items) {
          if (!identity.isPair(item))
            throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
        }
        if (!ctx.allNullValues && this.hasAllNullValues(false))
          ctx = Object.assign({}, ctx, { allNullValues: true });
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "",
          flowChars: { start: "{", end: "}" },
          itemIndent: ctx.indent || "",
          onChompKeep,
          onComment
        });
      }
    };
    exports.YAMLMap = YAMLMap;
    exports.findPair = findPair;
  }
});

// node_modules/yaml/dist/schema/common/map.js
var require_map = __commonJS({
  "node_modules/yaml/dist/schema/common/map.js"(exports) {
    "use strict";
    var identity = require_identity();
    var YAMLMap = require_YAMLMap();
    var map = {
      collection: "map",
      default: true,
      nodeClass: YAMLMap.YAMLMap,
      tag: "tag:yaml.org,2002:map",
      resolve(map2, onError) {
        if (!identity.isMap(map2))
          onError("Expected a mapping for this tag");
        return map2;
      },
      createNode: (schema, obj, ctx) => YAMLMap.YAMLMap.from(schema, obj, ctx)
    };
    exports.map = map;
  }
});

// node_modules/yaml/dist/nodes/YAMLSeq.js
var require_YAMLSeq = __commonJS({
  "node_modules/yaml/dist/nodes/YAMLSeq.js"(exports) {
    "use strict";
    var createNode = require_createNode();
    var stringifyCollection = require_stringifyCollection();
    var Collection = require_Collection();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var toJS = require_toJS();
    var YAMLSeq = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:seq";
      }
      constructor(schema) {
        super(identity.SEQ, schema);
        this.items = [];
      }
      add(value) {
        this.items.push(value);
      }
      /**
       * Removes a value from the collection.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       *
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return false;
        const del = this.items.splice(idx, 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return void 0;
        const it = this.items[idx];
        return !keepScalar && identity.isScalar(it) ? it.value : it;
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       */
      has(key) {
        const idx = asItemIndex(key);
        return typeof idx === "number" && idx < this.items.length;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       *
       * If `key` does not contain a representation of an integer, this will throw.
       * It may be wrapped in a `Scalar`.
       */
      set(key, value) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          throw new Error(`Expected a valid index, not ${key}.`);
        const prev = this.items[idx];
        if (identity.isScalar(prev) && Scalar.isScalarValue(value))
          prev.value = value;
        else
          this.items[idx] = value;
      }
      toJSON(_, ctx) {
        const seq = [];
        if (ctx?.onCreate)
          ctx.onCreate(seq);
        let i = 0;
        for (const item of this.items)
          seq.push(toJS.toJS(item, String(i++), ctx));
        return seq;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "- ",
          flowChars: { start: "[", end: "]" },
          itemIndent: (ctx.indent || "") + "  ",
          onChompKeep,
          onComment
        });
      }
      static from(schema, obj, ctx) {
        const { replacer } = ctx;
        const seq = new this(schema);
        if (obj && Symbol.iterator in Object(obj)) {
          let i = 0;
          for (let it of obj) {
            if (typeof replacer === "function") {
              const key = obj instanceof Set ? it : String(i++);
              it = replacer.call(obj, key, it);
            }
            seq.items.push(createNode.createNode(it, void 0, ctx));
          }
        }
        return seq;
      }
    };
    function asItemIndex(key) {
      let idx = identity.isScalar(key) ? key.value : key;
      if (idx && typeof idx === "string")
        idx = Number(idx);
      return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
    }
    exports.YAMLSeq = YAMLSeq;
  }
});

// node_modules/yaml/dist/schema/common/seq.js
var require_seq = __commonJS({
  "node_modules/yaml/dist/schema/common/seq.js"(exports) {
    "use strict";
    var identity = require_identity();
    var YAMLSeq = require_YAMLSeq();
    var seq = {
      collection: "seq",
      default: true,
      nodeClass: YAMLSeq.YAMLSeq,
      tag: "tag:yaml.org,2002:seq",
      resolve(seq2, onError) {
        if (!identity.isSeq(seq2))
          onError("Expected a sequence for this tag");
        return seq2;
      },
      createNode: (schema, obj, ctx) => YAMLSeq.YAMLSeq.from(schema, obj, ctx)
    };
    exports.seq = seq;
  }
});

// node_modules/yaml/dist/schema/common/string.js
var require_string = __commonJS({
  "node_modules/yaml/dist/schema/common/string.js"(exports) {
    "use strict";
    var stringifyString = require_stringifyString();
    var string = {
      identify: (value) => typeof value === "string",
      default: true,
      tag: "tag:yaml.org,2002:str",
      resolve: (str) => str,
      stringify(item, ctx, onComment, onChompKeep) {
        ctx = Object.assign({ actualString: true }, ctx);
        return stringifyString.stringifyString(item, ctx, onComment, onChompKeep);
      }
    };
    exports.string = string;
  }
});

// node_modules/yaml/dist/schema/common/null.js
var require_null = __commonJS({
  "node_modules/yaml/dist/schema/common/null.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var nullTag = {
      identify: (value) => value == null,
      createNode: () => new Scalar.Scalar(null),
      default: true,
      tag: "tag:yaml.org,2002:null",
      test: /^(?:~|[Nn]ull|NULL)?$/,
      resolve: () => new Scalar.Scalar(null),
      stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
    };
    exports.nullTag = nullTag;
  }
});

// node_modules/yaml/dist/schema/core/bool.js
var require_bool = __commonJS({
  "node_modules/yaml/dist/schema/core/bool.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var boolTag = {
      identify: (value) => typeof value === "boolean",
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
      resolve: (str) => new Scalar.Scalar(str[0] === "t" || str[0] === "T"),
      stringify({ source, value }, ctx) {
        if (source && boolTag.test.test(source)) {
          const sv = source[0] === "t" || source[0] === "T";
          if (value === sv)
            return source;
        }
        return value ? ctx.options.trueStr : ctx.options.falseStr;
      }
    };
    exports.boolTag = boolTag;
  }
});

// node_modules/yaml/dist/stringify/stringifyNumber.js
var require_stringifyNumber = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyNumber.js"(exports) {
    "use strict";
    function stringifyNumber({ format, minFractionDigits, tag, value }) {
      if (typeof value === "bigint")
        return String(value);
      const num = typeof value === "number" ? value : Number(value);
      if (!isFinite(num))
        return isNaN(num) ? ".nan" : num < 0 ? "-.inf" : ".inf";
      let n = Object.is(value, -0) ? "-0" : JSON.stringify(value);
      if (!format && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^-?\d/.test(n) && !n.includes("e")) {
        let i = n.indexOf(".");
        if (i < 0) {
          i = n.length;
          n += ".";
        }
        let d = minFractionDigits - (n.length - i - 1);
        while (d-- > 0)
          n += "0";
      }
      return n;
    }
    exports.stringifyNumber = stringifyNumber;
  }
});

// node_modules/yaml/dist/schema/core/float.js
var require_float = __commonJS({
  "node_modules/yaml/dist/schema/core/float.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
      resolve: (str) => parseFloat(str),
      stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
      resolve(str) {
        const node = new Scalar.Scalar(parseFloat(str));
        const dot = str.indexOf(".");
        if (dot !== -1 && str[str.length - 1] === "0")
          node.minFractionDigits = str.length - dot - 1;
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports.float = float;
    exports.floatExp = floatExp;
    exports.floatNaN = floatNaN;
  }
});

// node_modules/yaml/dist/schema/core/int.js
var require_int = __commonJS({
  "node_modules/yaml/dist/schema/core/int.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    var intResolve = (str, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix);
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value) && value >= 0)
        return prefix + value.toString(radix);
      return stringifyNumber.stringifyNumber(node);
    }
    var intOct = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^0o[0-7]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 8, opt),
      stringify: (node) => intStringify(node, 8, "0o")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^0x[0-9a-fA-F]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports.int = int;
    exports.intHex = intHex;
    exports.intOct = intOct;
  }
});

// node_modules/yaml/dist/schema/core/schema.js
var require_schema = __commonJS({
  "node_modules/yaml/dist/schema/core/schema.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool = require_bool();
    var float = require_float();
    var int = require_int();
    var schema = [
      map.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool.boolTag,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float
    ];
    exports.schema = schema;
  }
});

// node_modules/yaml/dist/schema/json/schema.js
var require_schema2 = __commonJS({
  "node_modules/yaml/dist/schema/json/schema.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var map = require_map();
    var seq = require_seq();
    function intIdentify(value) {
      return typeof value === "bigint" || Number.isInteger(value);
    }
    var stringifyJSON = ({ value }) => JSON.stringify(value);
    var jsonScalars = [
      {
        identify: (value) => typeof value === "string",
        default: true,
        tag: "tag:yaml.org,2002:str",
        resolve: (str) => str,
        stringify: stringifyJSON
      },
      {
        identify: (value) => value == null,
        createNode: () => new Scalar.Scalar(null),
        default: true,
        tag: "tag:yaml.org,2002:null",
        test: /^null$/,
        resolve: () => null,
        stringify: stringifyJSON
      },
      {
        identify: (value) => typeof value === "boolean",
        default: true,
        tag: "tag:yaml.org,2002:bool",
        test: /^true$|^false$/,
        resolve: (str) => str === "true",
        stringify: stringifyJSON
      },
      {
        identify: intIdentify,
        default: true,
        tag: "tag:yaml.org,2002:int",
        test: /^-?(?:0|[1-9][0-9]*)$/,
        resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
        stringify: ({ value }) => intIdentify(value) ? value.toString() : JSON.stringify(value)
      },
      {
        identify: (value) => typeof value === "number",
        default: true,
        tag: "tag:yaml.org,2002:float",
        test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
        resolve: (str) => parseFloat(str),
        stringify: stringifyJSON
      }
    ];
    var jsonError = {
      default: true,
      tag: "",
      test: /^/,
      resolve(str, onError) {
        onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
        return str;
      }
    };
    var schema = [map.map, seq.seq].concat(jsonScalars, jsonError);
    exports.schema = schema;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/binary.js
var require_binary = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/binary.js"(exports) {
    "use strict";
    var node_buffer = __require("buffer");
    var Scalar = require_Scalar();
    var stringifyString = require_stringifyString();
    var binary = {
      identify: (value) => value instanceof Uint8Array,
      // Buffer inherits from Uint8Array
      default: false,
      tag: "tag:yaml.org,2002:binary",
      /**
       * Returns a Buffer in node and an Uint8Array in browsers
       *
       * To use the resulting buffer as an image, you'll want to do something like:
       *
       *   const blob = new Blob([buffer], { type: 'image/jpeg' })
       *   document.querySelector('#photo').src = URL.createObjectURL(blob)
       */
      resolve(src, onError) {
        if (typeof node_buffer.Buffer === "function") {
          return node_buffer.Buffer.from(src, "base64");
        } else if (typeof atob === "function") {
          const str = atob(src.replace(/[\n\r]/g, ""));
          const buffer = new Uint8Array(str.length);
          for (let i = 0; i < str.length; ++i)
            buffer[i] = str.charCodeAt(i);
          return buffer;
        } else {
          onError("This environment does not support reading binary tags; either Buffer or atob is required");
          return src;
        }
      },
      stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
        if (!value)
          return "";
        const buf = value;
        let str;
        if (typeof node_buffer.Buffer === "function") {
          str = buf instanceof node_buffer.Buffer ? buf.toString("base64") : node_buffer.Buffer.from(buf.buffer).toString("base64");
        } else if (typeof btoa === "function") {
          let s = "";
          for (let i = 0; i < buf.length; ++i)
            s += String.fromCharCode(buf[i]);
          str = btoa(s);
        } else {
          throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
        }
        type ?? (type = Scalar.Scalar.BLOCK_LITERAL);
        if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
          const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
          const n = Math.ceil(str.length / lineWidth);
          const lines = new Array(n);
          for (let i = 0, o = 0; i < n; ++i, o += lineWidth) {
            lines[i] = str.substr(o, lineWidth);
          }
          str = lines.join(type === Scalar.Scalar.BLOCK_LITERAL ? "\n" : " ");
        }
        return stringifyString.stringifyString({ comment, type, value: str }, ctx, onComment, onChompKeep);
      }
    };
    exports.binary = binary;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/pairs.js
var require_pairs = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/pairs.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLSeq = require_YAMLSeq();
    function resolvePairs(seq, onError) {
      if (identity.isSeq(seq)) {
        for (let i = 0; i < seq.items.length; ++i) {
          let item = seq.items[i];
          if (identity.isPair(item))
            continue;
          else if (identity.isMap(item)) {
            if (item.items.length > 1)
              onError("Each pair must have its own sequence indicator");
            const pair = item.items[0] || new Pair.Pair(new Scalar.Scalar(null));
            if (item.commentBefore)
              pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}
${pair.key.commentBefore}` : item.commentBefore;
            if (item.comment) {
              const cn = pair.value ?? pair.key;
              cn.comment = cn.comment ? `${item.comment}
${cn.comment}` : item.comment;
            }
            item = pair;
          }
          seq.items[i] = identity.isPair(item) ? item : new Pair.Pair(item);
        }
      } else
        onError("Expected a sequence for this tag");
      return seq;
    }
    function createPairs(schema, iterable, ctx) {
      const { replacer } = ctx;
      const pairs2 = new YAMLSeq.YAMLSeq(schema);
      pairs2.tag = "tag:yaml.org,2002:pairs";
      let i = 0;
      if (iterable && Symbol.iterator in Object(iterable))
        for (let it of iterable) {
          if (typeof replacer === "function")
            it = replacer.call(iterable, String(i++), it);
          let key, value;
          if (Array.isArray(it)) {
            if (it.length === 2) {
              key = it[0];
              value = it[1];
            } else
              throw new TypeError(`Expected [key, value] tuple: ${it}`);
          } else if (it && it instanceof Object) {
            const keys = Object.keys(it);
            if (keys.length === 1) {
              key = keys[0];
              value = it[key];
            } else {
              throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
            }
          } else {
            key = it;
          }
          pairs2.items.push(Pair.createPair(key, value, ctx));
        }
      return pairs2;
    }
    var pairs = {
      collection: "seq",
      default: false,
      tag: "tag:yaml.org,2002:pairs",
      resolve: resolvePairs,
      createNode: createPairs
    };
    exports.createPairs = createPairs;
    exports.pairs = pairs;
    exports.resolvePairs = resolvePairs;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/omap.js
var require_omap = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/omap.js"(exports) {
    "use strict";
    var identity = require_identity();
    var toJS = require_toJS();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var pairs = require_pairs();
    var YAMLOMap = class _YAMLOMap extends YAMLSeq.YAMLSeq {
      constructor() {
        super();
        this.add = YAMLMap.YAMLMap.prototype.add.bind(this);
        this.delete = YAMLMap.YAMLMap.prototype.delete.bind(this);
        this.get = YAMLMap.YAMLMap.prototype.get.bind(this);
        this.has = YAMLMap.YAMLMap.prototype.has.bind(this);
        this.set = YAMLMap.YAMLMap.prototype.set.bind(this);
        this.tag = _YAMLOMap.tag;
      }
      /**
       * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
       * but TypeScript won't allow widening the signature of a child method.
       */
      toJSON(_, ctx) {
        if (!ctx)
          return super.toJSON(_);
        const map = /* @__PURE__ */ new Map();
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const pair of this.items) {
          let key, value;
          if (identity.isPair(pair)) {
            key = toJS.toJS(pair.key, "", ctx);
            value = toJS.toJS(pair.value, key, ctx);
          } else {
            key = toJS.toJS(pair, "", ctx);
          }
          if (map.has(key))
            throw new Error("Ordered maps must not include duplicate keys");
          map.set(key, value);
        }
        return map;
      }
      static from(schema, iterable, ctx) {
        const pairs$1 = pairs.createPairs(schema, iterable, ctx);
        const omap2 = new this();
        omap2.items = pairs$1.items;
        return omap2;
      }
    };
    YAMLOMap.tag = "tag:yaml.org,2002:omap";
    var omap = {
      collection: "seq",
      identify: (value) => value instanceof Map,
      nodeClass: YAMLOMap,
      default: false,
      tag: "tag:yaml.org,2002:omap",
      resolve(seq, onError) {
        const pairs$1 = pairs.resolvePairs(seq, onError);
        const seenKeys = [];
        for (const { key } of pairs$1.items) {
          if (identity.isScalar(key)) {
            if (seenKeys.includes(key.value)) {
              onError(`Ordered maps must not include duplicate keys: ${key.value}`);
            } else {
              seenKeys.push(key.value);
            }
          }
        }
        return Object.assign(new YAMLOMap(), pairs$1);
      },
      createNode: (schema, iterable, ctx) => YAMLOMap.from(schema, iterable, ctx)
    };
    exports.YAMLOMap = YAMLOMap;
    exports.omap = omap;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/bool.js
var require_bool2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/bool.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    function boolStringify({ value, source }, ctx) {
      const boolObj = value ? trueTag : falseTag;
      if (source && boolObj.test.test(source))
        return source;
      return value ? ctx.options.trueStr : ctx.options.falseStr;
    }
    var trueTag = {
      identify: (value) => value === true,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
      resolve: () => new Scalar.Scalar(true),
      stringify: boolStringify
    };
    var falseTag = {
      identify: (value) => value === false,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
      resolve: () => new Scalar.Scalar(false),
      stringify: boolStringify
    };
    exports.falseTag = falseTag;
    exports.trueTag = trueTag;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/float.js
var require_float2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/float.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
      resolve: (str) => parseFloat(str.replace(/_/g, "")),
      stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
      resolve(str) {
        const node = new Scalar.Scalar(parseFloat(str.replace(/_/g, "")));
        const dot = str.indexOf(".");
        if (dot !== -1) {
          const f = str.substring(dot + 1).replace(/_/g, "");
          if (f[f.length - 1] === "0")
            node.minFractionDigits = f.length;
        }
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports.float = float;
    exports.floatExp = floatExp;
    exports.floatNaN = floatNaN;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/int.js
var require_int2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/int.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    function intResolve(str, offset, radix, { intAsBigInt }) {
      const sign = str[0];
      if (sign === "-" || sign === "+")
        offset += 1;
      str = str.substring(offset).replace(/_/g, "");
      if (intAsBigInt) {
        switch (radix) {
          case 2:
            str = `0b${str}`;
            break;
          case 8:
            str = `0o${str}`;
            break;
          case 16:
            str = `0x${str}`;
            break;
        }
        const n2 = BigInt(str);
        return sign === "-" ? BigInt(-1) * n2 : n2;
      }
      const n = parseInt(str, radix);
      return sign === "-" ? -1 * n : n;
    }
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value)) {
        const str = value.toString(radix);
        return value < 0 ? "-" + prefix + str.substr(1) : prefix + str;
      }
      return stringifyNumber.stringifyNumber(node);
    }
    var intBin = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "BIN",
      test: /^[-+]?0b[0-1_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
      stringify: (node) => intStringify(node, 2, "0b")
    };
    var intOct = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^[-+]?0[0-7_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
      stringify: (node) => intStringify(node, 8, "0")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9][0-9_]*$/,
      resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^[-+]?0x[0-9a-fA-F_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports.int = int;
    exports.intBin = intBin;
    exports.intHex = intHex;
    exports.intOct = intOct;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/set.js
var require_set = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/set.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSet = class _YAMLSet extends YAMLMap.YAMLMap {
      constructor(schema) {
        super(schema);
        this.tag = _YAMLSet.tag;
      }
      add(key) {
        let pair;
        if (identity.isPair(key))
          pair = key;
        else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
          pair = new Pair.Pair(key.key, null);
        else
          pair = new Pair.Pair(key, null);
        const prev = YAMLMap.findPair(this.items, pair.key);
        if (!prev)
          this.items.push(pair);
      }
      /**
       * If `keepPair` is `true`, returns the Pair matching `key`.
       * Otherwise, returns the value of that Pair's key.
       */
      get(key, keepPair) {
        const pair = YAMLMap.findPair(this.items, key);
        return !keepPair && identity.isPair(pair) ? identity.isScalar(pair.key) ? pair.key.value : pair.key : pair;
      }
      set(key, value) {
        if (typeof value !== "boolean")
          throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
        const prev = YAMLMap.findPair(this.items, key);
        if (prev && !value) {
          this.items.splice(this.items.indexOf(prev), 1);
        } else if (!prev && value) {
          this.items.push(new Pair.Pair(key));
        }
      }
      toJSON(_, ctx) {
        return super.toJSON(_, ctx, Set);
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        if (this.hasAllNullValues(true))
          return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
        else
          throw new Error("Set items must all have null values");
      }
      static from(schema, iterable, ctx) {
        const { replacer } = ctx;
        const set2 = new this(schema);
        if (iterable && Symbol.iterator in Object(iterable))
          for (let value of iterable) {
            if (typeof replacer === "function")
              value = replacer.call(iterable, value, value);
            set2.items.push(Pair.createPair(value, null, ctx));
          }
        return set2;
      }
    };
    YAMLSet.tag = "tag:yaml.org,2002:set";
    var set = {
      collection: "map",
      identify: (value) => value instanceof Set,
      nodeClass: YAMLSet,
      default: false,
      tag: "tag:yaml.org,2002:set",
      createNode: (schema, iterable, ctx) => YAMLSet.from(schema, iterable, ctx),
      resolve(map, onError) {
        if (identity.isMap(map)) {
          if (map.hasAllNullValues(true))
            return Object.assign(new YAMLSet(), map);
          else
            onError("Set items must all have null values");
        } else
          onError("Expected a mapping for this tag");
        return map;
      }
    };
    exports.YAMLSet = YAMLSet;
    exports.set = set;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/timestamp.js
var require_timestamp = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/timestamp.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    function parseSexagesimal(str, asBigInt) {
      const sign = str[0];
      const parts = sign === "-" || sign === "+" ? str.substring(1) : str;
      const num = (n) => asBigInt ? BigInt(n) : Number(n);
      const res = parts.replace(/_/g, "").split(":").reduce((res2, p) => res2 * num(60) + num(p), num(0));
      return sign === "-" ? num(-1) * res : res;
    }
    function stringifySexagesimal(node) {
      let { value } = node;
      let num = (n) => n;
      if (typeof value === "bigint")
        num = (n) => BigInt(n);
      else if (isNaN(value) || !isFinite(value))
        return stringifyNumber.stringifyNumber(node);
      let sign = "";
      if (value < 0) {
        sign = "-";
        value *= num(-1);
      }
      const _60 = num(60);
      const parts = [value % _60];
      if (value < 60) {
        parts.unshift(0);
      } else {
        value = (value - parts[0]) / _60;
        parts.unshift(value % _60);
        if (value >= 60) {
          value = (value - parts[0]) / _60;
          parts.unshift(value);
        }
      }
      return sign + parts.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
    }
    var intTime = {
      identify: (value) => typeof value === "bigint" || Number.isInteger(value),
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
      resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
      stringify: stringifySexagesimal
    };
    var floatTime = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
      resolve: (str) => parseSexagesimal(str, false),
      stringify: stringifySexagesimal
    };
    var timestamp = {
      identify: (value) => value instanceof Date,
      default: true,
      tag: "tag:yaml.org,2002:timestamp",
      // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
      // may be omitted altogether, resulting in a date format. In such a case, the time part is
      // assumed to be 00:00:00Z (start of day, UTC).
      test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
      resolve(str) {
        const match = str.match(timestamp.test);
        if (!match)
          throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
        const [, year, month, day, hour, minute, second] = match.map(Number);
        const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
        let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
        const tz = match[8];
        if (tz && tz !== "Z") {
          let d = parseSexagesimal(tz, false);
          if (Math.abs(d) < 30)
            d *= 60;
          date -= 6e4 * d;
        }
        return new Date(date);
      },
      stringify: ({ value }) => value?.toISOString().replace(/(T00:00:00)?\.000Z$/, "") ?? ""
    };
    exports.floatTime = floatTime;
    exports.intTime = intTime;
    exports.timestamp = timestamp;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/schema.js
var require_schema3 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/schema.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var binary = require_binary();
    var bool = require_bool2();
    var float = require_float2();
    var int = require_int2();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var set = require_set();
    var timestamp = require_timestamp();
    var schema = [
      map.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool.trueTag,
      bool.falseTag,
      int.intBin,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float,
      binary.binary,
      merge.merge,
      omap.omap,
      pairs.pairs,
      set.set,
      timestamp.intTime,
      timestamp.floatTime,
      timestamp.timestamp
    ];
    exports.schema = schema;
  }
});

// node_modules/yaml/dist/schema/tags.js
var require_tags = __commonJS({
  "node_modules/yaml/dist/schema/tags.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool = require_bool();
    var float = require_float();
    var int = require_int();
    var schema = require_schema();
    var schema$1 = require_schema2();
    var binary = require_binary();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var schema$2 = require_schema3();
    var set = require_set();
    var timestamp = require_timestamp();
    var schemas = /* @__PURE__ */ new Map([
      ["core", schema.schema],
      ["failsafe", [map.map, seq.seq, string.string]],
      ["json", schema$1.schema],
      ["yaml11", schema$2.schema],
      ["yaml-1.1", schema$2.schema]
    ]);
    var tagsByName = {
      binary: binary.binary,
      bool: bool.boolTag,
      float: float.float,
      floatExp: float.floatExp,
      floatNaN: float.floatNaN,
      floatTime: timestamp.floatTime,
      int: int.int,
      intHex: int.intHex,
      intOct: int.intOct,
      intTime: timestamp.intTime,
      map: map.map,
      merge: merge.merge,
      null: _null.nullTag,
      omap: omap.omap,
      pairs: pairs.pairs,
      seq: seq.seq,
      set: set.set,
      timestamp: timestamp.timestamp
    };
    var coreKnownTags = {
      "tag:yaml.org,2002:binary": binary.binary,
      "tag:yaml.org,2002:merge": merge.merge,
      "tag:yaml.org,2002:omap": omap.omap,
      "tag:yaml.org,2002:pairs": pairs.pairs,
      "tag:yaml.org,2002:set": set.set,
      "tag:yaml.org,2002:timestamp": timestamp.timestamp
    };
    function getTags(customTags, schemaName, addMergeTag) {
      const schemaTags = schemas.get(schemaName);
      if (schemaTags && !customTags) {
        return addMergeTag && !schemaTags.includes(merge.merge) ? schemaTags.concat(merge.merge) : schemaTags.slice();
      }
      let tags = schemaTags;
      if (!tags) {
        if (Array.isArray(customTags))
          tags = [];
        else {
          const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
        }
      }
      if (Array.isArray(customTags)) {
        for (const tag of customTags)
          tags = tags.concat(tag);
      } else if (typeof customTags === "function") {
        tags = customTags(tags.slice());
      }
      if (addMergeTag)
        tags = tags.concat(merge.merge);
      return tags.reduce((tags2, tag) => {
        const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
        if (!tagObj) {
          const tagName = JSON.stringify(tag);
          const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
        }
        if (!tags2.includes(tagObj))
          tags2.push(tagObj);
        return tags2;
      }, []);
    }
    exports.coreKnownTags = coreKnownTags;
    exports.getTags = getTags;
  }
});

// node_modules/yaml/dist/schema/Schema.js
var require_Schema = __commonJS({
  "node_modules/yaml/dist/schema/Schema.js"(exports) {
    "use strict";
    var identity = require_identity();
    var map = require_map();
    var seq = require_seq();
    var string = require_string();
    var tags = require_tags();
    var sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
    var Schema = class _Schema {
      constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
        this.compat = Array.isArray(compat) ? tags.getTags(compat, "compat") : compat ? tags.getTags(null, compat) : null;
        this.name = typeof schema === "string" && schema || "core";
        this.knownTags = resolveKnownTags ? tags.coreKnownTags : {};
        this.tags = tags.getTags(customTags, this.name, merge);
        this.toStringOptions = toStringDefaults ?? null;
        Object.defineProperty(this, identity.MAP, { value: map.map });
        Object.defineProperty(this, identity.SCALAR, { value: string.string });
        Object.defineProperty(this, identity.SEQ, { value: seq.seq });
        this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
      }
      clone() {
        const copy = Object.create(_Schema.prototype, Object.getOwnPropertyDescriptors(this));
        copy.tags = this.tags.slice();
        return copy;
      }
    };
    exports.Schema = Schema;
  }
});

// node_modules/yaml/dist/stringify/stringifyDocument.js
var require_stringifyDocument = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyDocument.js"(exports) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyDocument(doc, options) {
      const lines = [];
      let hasDirectives = options.directives === true;
      if (options.directives !== false && doc.directives) {
        const dir = doc.directives.toString(doc);
        if (dir) {
          lines.push(dir);
          hasDirectives = true;
        } else if (doc.directives.docStart)
          hasDirectives = true;
      }
      if (hasDirectives)
        lines.push("---");
      const ctx = stringify.createStringifyContext(doc, options);
      const { commentString } = ctx.options;
      if (doc.commentBefore) {
        if (lines.length !== 1)
          lines.unshift("");
        const cs = commentString(doc.commentBefore);
        lines.unshift(stringifyComment.indentComment(cs, ""));
      }
      let chompKeep = false;
      let contentComment = null;
      if (doc.contents) {
        if (identity.isNode(doc.contents)) {
          if (doc.contents.spaceBefore && hasDirectives)
            lines.push("");
          if (doc.contents.commentBefore) {
            const cs = commentString(doc.contents.commentBefore);
            lines.push(stringifyComment.indentComment(cs, ""));
          }
          ctx.forceBlockIndent = !!doc.comment;
          contentComment = doc.contents.comment;
        }
        const onChompKeep = contentComment ? void 0 : () => chompKeep = true;
        let body = stringify.stringify(doc.contents, ctx, () => contentComment = null, onChompKeep);
        if (contentComment)
          body += stringifyComment.lineComment(body, "", commentString(contentComment));
        if ((body[0] === "|" || body[0] === ">") && lines[lines.length - 1] === "---") {
          lines[lines.length - 1] = `--- ${body}`;
        } else
          lines.push(body);
      } else {
        lines.push(stringify.stringify(doc.contents, ctx));
      }
      if (doc.directives?.docEnd) {
        if (doc.comment) {
          const cs = commentString(doc.comment);
          if (cs.includes("\n")) {
            lines.push("...");
            lines.push(stringifyComment.indentComment(cs, ""));
          } else {
            lines.push(`... ${cs}`);
          }
        } else {
          lines.push("...");
        }
      } else {
        let dc = doc.comment;
        if (dc && chompKeep)
          dc = dc.replace(/^\n+/, "");
        if (dc) {
          if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "")
            lines.push("");
          lines.push(stringifyComment.indentComment(commentString(dc), ""));
        }
      }
      return lines.join("\n") + "\n";
    }
    exports.stringifyDocument = stringifyDocument;
  }
});

// node_modules/yaml/dist/doc/Document.js
var require_Document = __commonJS({
  "node_modules/yaml/dist/doc/Document.js"(exports) {
    "use strict";
    var Alias = require_Alias();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var toJS = require_toJS();
    var Schema = require_Schema();
    var stringifyDocument = require_stringifyDocument();
    var anchors = require_anchors();
    var applyReviver = require_applyReviver();
    var createNode = require_createNode();
    var directives = require_directives();
    var Document = class _Document {
      constructor(value, replacer, options) {
        this.commentBefore = null;
        this.comment = null;
        this.errors = [];
        this.warnings = [];
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.DOC });
        let _replacer = null;
        if (typeof replacer === "function" || Array.isArray(replacer)) {
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const opt = Object.assign({
          intAsBigInt: false,
          keepSourceTokens: false,
          logLevel: "warn",
          prettyErrors: true,
          strict: true,
          stringKeys: false,
          uniqueKeys: true,
          version: "1.2"
        }, options);
        this.options = opt;
        let { version } = opt;
        if (options?._directives) {
          this.directives = options._directives.atDocument();
          if (this.directives.yaml.explicit)
            version = this.directives.yaml.version;
        } else
          this.directives = new directives.Directives({ version });
        this.setSchema(version, options);
        this.contents = value === void 0 ? null : this.createNode(value, _replacer, options);
      }
      /**
       * Create a deep copy of this Document and its contents.
       *
       * Custom Node values that inherit from `Object` still refer to their original instances.
       */
      clone() {
        const copy = Object.create(_Document.prototype, {
          [identity.NODE_TYPE]: { value: identity.DOC }
        });
        copy.commentBefore = this.commentBefore;
        copy.comment = this.comment;
        copy.errors = this.errors.slice();
        copy.warnings = this.warnings.slice();
        copy.options = Object.assign({}, this.options);
        if (this.directives)
          copy.directives = this.directives.clone();
        copy.schema = this.schema.clone();
        copy.contents = identity.isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** Adds a value to the document. */
      add(value) {
        if (assertCollection(this.contents))
          this.contents.add(value);
      }
      /** Adds a value to the document. */
      addIn(path, value) {
        if (assertCollection(this.contents))
          this.contents.addIn(path, value);
      }
      /**
       * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
       *
       * If `node` already has an anchor, `name` is ignored.
       * Otherwise, the `node.anchor` value will be set to `name`,
       * or if an anchor with that name is already present in the document,
       * `name` will be used as a prefix for a new unique anchor.
       * If `name` is undefined, the generated anchor will use 'a' as a prefix.
       */
      createAlias(node, name) {
        if (!node.anchor) {
          const prev = anchors.anchorNames(this);
          node.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          !name || prev.has(name) ? anchors.findNewAnchor(name || "a", prev) : name;
        }
        return new Alias.Alias(node.anchor);
      }
      createNode(value, replacer, options) {
        let _replacer = void 0;
        if (typeof replacer === "function") {
          value = replacer.call({ "": value }, "", value);
          _replacer = replacer;
        } else if (Array.isArray(replacer)) {
          const keyToStr = (v) => typeof v === "number" || v instanceof String || v instanceof Number;
          const asStr = replacer.filter(keyToStr).map(String);
          if (asStr.length > 0)
            replacer = replacer.concat(asStr);
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
        const { onAnchor, setAnchors, sourceObjects } = anchors.createNodeAnchors(
          this,
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          anchorPrefix || "a"
        );
        const ctx = {
          aliasDuplicateObjects: aliasDuplicateObjects ?? true,
          keepUndefined: keepUndefined ?? false,
          onAnchor,
          onTagObj,
          replacer: _replacer,
          schema: this.schema,
          sourceObjects
        };
        const node = createNode.createNode(value, tag, ctx);
        if (flow && identity.isCollection(node))
          node.flow = true;
        setAnchors();
        return node;
      }
      /**
       * Convert a key and a value into a `Pair` using the current schema,
       * recursively wrapping all values as `Scalar` or `Collection` nodes.
       */
      createPair(key, value, options = {}) {
        const k = this.createNode(key, null, options);
        const v = this.createNode(value, null, options);
        return new Pair.Pair(k, v);
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        return assertCollection(this.contents) ? this.contents.delete(key) : false;
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path) {
        if (Collection.isEmptyPath(path)) {
          if (this.contents == null)
            return false;
          this.contents = null;
          return true;
        }
        return assertCollection(this.contents) ? this.contents.deleteIn(path) : false;
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      get(key, keepScalar) {
        return identity.isCollection(this.contents) ? this.contents.get(key, keepScalar) : void 0;
      }
      /**
       * Returns item at `path`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path, keepScalar) {
        if (Collection.isEmptyPath(path))
          return !keepScalar && identity.isScalar(this.contents) ? this.contents.value : this.contents;
        return identity.isCollection(this.contents) ? this.contents.getIn(path, keepScalar) : void 0;
      }
      /**
       * Checks if the document includes a value with the key `key`.
       */
      has(key) {
        return identity.isCollection(this.contents) ? this.contents.has(key) : false;
      }
      /**
       * Checks if the document includes a value at `path`.
       */
      hasIn(path) {
        if (Collection.isEmptyPath(path))
          return this.contents !== void 0;
        return identity.isCollection(this.contents) ? this.contents.hasIn(path) : false;
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      set(key, value) {
        if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, [key], value);
        } else if (assertCollection(this.contents)) {
          this.contents.set(key, value);
        }
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path, value) {
        if (Collection.isEmptyPath(path)) {
          this.contents = value;
        } else if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, Array.from(path), value);
        } else if (assertCollection(this.contents)) {
          this.contents.setIn(path, value);
        }
      }
      /**
       * Change the YAML version and schema used by the document.
       * A `null` version disables support for directives, explicit tags, anchors, and aliases.
       * It also requires the `schema` option to be given as a `Schema` instance value.
       *
       * Overrides all previously set schema options.
       */
      setSchema(version, options = {}) {
        if (typeof version === "number")
          version = String(version);
        let opt;
        switch (version) {
          case "1.1":
            if (this.directives)
              this.directives.yaml.version = "1.1";
            else
              this.directives = new directives.Directives({ version: "1.1" });
            opt = { resolveKnownTags: false, schema: "yaml-1.1" };
            break;
          case "1.2":
          case "next":
            if (this.directives)
              this.directives.yaml.version = version;
            else
              this.directives = new directives.Directives({ version });
            opt = { resolveKnownTags: true, schema: "core" };
            break;
          case null:
            if (this.directives)
              delete this.directives;
            opt = null;
            break;
          default: {
            const sv = JSON.stringify(version);
            throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
          }
        }
        if (options.schema instanceof Object)
          this.schema = options.schema;
        else if (opt)
          this.schema = new Schema.Schema(Object.assign(opt, options));
        else
          throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
      }
      // json & jsonArg are only used from toJSON()
      toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc: this,
          keep: !json,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this.contents, jsonArg ?? "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
      /**
       * A JSON representation of the document `contents`.
       *
       * @param jsonArg Used by `JSON.stringify` to indicate the array index or
       *   property name.
       */
      toJSON(jsonArg, onAnchor) {
        return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
      }
      /** A YAML representation of the document. */
      toString(options = {}) {
        if (this.errors.length > 0)
          throw new Error("Document with errors cannot be stringified");
        if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
          const s = JSON.stringify(options.indent);
          throw new Error(`"indent" option must be a positive integer, not ${s}`);
        }
        return stringifyDocument.stringifyDocument(this, options);
      }
    };
    function assertCollection(contents) {
      if (identity.isCollection(contents))
        return true;
      throw new Error("Expected a YAML collection as document contents");
    }
    exports.Document = Document;
  }
});

// node_modules/yaml/dist/errors.js
var require_errors = __commonJS({
  "node_modules/yaml/dist/errors.js"(exports) {
    "use strict";
    var YAMLError = class extends Error {
      constructor(name, pos, code, message) {
        super();
        this.name = name;
        this.code = code;
        this.message = message;
        this.pos = pos;
      }
    };
    var YAMLParseError = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLParseError", pos, code, message);
      }
    };
    var YAMLWarning = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLWarning", pos, code, message);
      }
    };
    var prettifyError = (src, lc) => (error) => {
      if (error.pos[0] === -1)
        return;
      error.linePos = error.pos.map((pos) => lc.linePos(pos));
      const { line, col } = error.linePos[0];
      error.message += ` at line ${line}, column ${col}`;
      let ci = col - 1;
      let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
      if (ci >= 60 && lineStr.length > 80) {
        const trimStart = Math.min(ci - 39, lineStr.length - 79);
        lineStr = "\u2026" + lineStr.substring(trimStart);
        ci -= trimStart - 1;
      }
      if (lineStr.length > 80)
        lineStr = lineStr.substring(0, 79) + "\u2026";
      if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
        let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
        if (prev.length > 80)
          prev = prev.substring(0, 79) + "\u2026\n";
        lineStr = prev + lineStr;
      }
      if (/[^ ]/.test(lineStr)) {
        let count = 1;
        const end = error.linePos[1];
        if (end?.line === line && end.col > col) {
          count = Math.max(1, Math.min(end.col - col, 80 - ci));
        }
        const pointer = " ".repeat(ci) + "^".repeat(count);
        error.message += `:

${lineStr}
${pointer}
`;
      }
    };
    exports.YAMLError = YAMLError;
    exports.YAMLParseError = YAMLParseError;
    exports.YAMLWarning = YAMLWarning;
    exports.prettifyError = prettifyError;
  }
});

// node_modules/yaml/dist/compose/resolve-props.js
var require_resolve_props = __commonJS({
  "node_modules/yaml/dist/compose/resolve-props.js"(exports) {
    "use strict";
    function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
      let spaceBefore = false;
      let atNewline = startOnNewline;
      let hasSpace = startOnNewline;
      let comment = "";
      let commentSep = "";
      let hasNewline = false;
      let reqSpace = false;
      let tab = null;
      let anchor = null;
      let tag = null;
      let newlineAfterProp = null;
      let comma = null;
      let found = null;
      let start = null;
      for (const token of tokens) {
        if (reqSpace) {
          if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
            onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
          reqSpace = false;
        }
        if (tab) {
          if (atNewline && token.type !== "comment" && token.type !== "newline") {
            onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
          }
          tab = null;
        }
        switch (token.type) {
          case "space":
            if (!flow && (indicator !== "doc-start" || next?.type !== "flow-collection") && token.source.includes("	")) {
              tab = token;
            }
            hasSpace = true;
            break;
          case "comment": {
            if (!hasSpace)
              onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            const cb = token.source.substring(1) || " ";
            if (!comment)
              comment = cb;
            else
              comment += commentSep + cb;
            commentSep = "";
            atNewline = false;
            break;
          }
          case "newline":
            if (atNewline) {
              if (comment)
                comment += token.source;
              else if (!found || indicator !== "seq-item-ind")
                spaceBefore = true;
            } else
              commentSep += token.source;
            atNewline = true;
            hasNewline = true;
            if (anchor || tag)
              newlineAfterProp = token;
            hasSpace = true;
            break;
          case "anchor":
            if (anchor)
              onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
            if (token.source.endsWith(":"))
              onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
            anchor = token;
            start ?? (start = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          case "tag": {
            if (tag)
              onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
            tag = token;
            start ?? (start = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          }
          case indicator:
            if (anchor || tag)
              onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
            if (found)
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
            found = token;
            atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
            hasSpace = false;
            break;
          case "comma":
            if (flow) {
              if (comma)
                onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
              comma = token;
              atNewline = false;
              hasSpace = false;
              break;
            }
          // else fallthrough
          default:
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
            atNewline = false;
            hasSpace = false;
        }
      }
      const last = tokens[tokens.length - 1];
      const end = last ? last.offset + last.source.length : offset;
      if (reqSpace && next && next.type !== "space" && next.type !== "newline" && next.type !== "comma" && (next.type !== "scalar" || next.source !== "")) {
        onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
      }
      if (tab && (atNewline && tab.indent <= parentIndent || next?.type === "block-map" || next?.type === "block-seq"))
        onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
      return {
        comma,
        found,
        spaceBefore,
        comment,
        hasNewline,
        anchor,
        tag,
        newlineAfterProp,
        end,
        start: start ?? end
      };
    }
    exports.resolveProps = resolveProps;
  }
});

// node_modules/yaml/dist/compose/util-contains-newline.js
var require_util_contains_newline = __commonJS({
  "node_modules/yaml/dist/compose/util-contains-newline.js"(exports) {
    "use strict";
    function containsNewline(key) {
      if (!key)
        return null;
      switch (key.type) {
        case "alias":
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          if (key.source.includes("\n"))
            return true;
          if (key.end) {
            for (const st of key.end)
              if (st.type === "newline")
                return true;
          }
          return false;
        case "flow-collection":
          for (const it of key.items) {
            for (const st of it.start)
              if (st.type === "newline")
                return true;
            if (it.sep) {
              for (const st of it.sep)
                if (st.type === "newline")
                  return true;
            }
            if (containsNewline(it.key) || containsNewline(it.value))
              return true;
          }
          return false;
        default:
          return true;
      }
    }
    exports.containsNewline = containsNewline;
  }
});

// node_modules/yaml/dist/compose/util-flow-indent-check.js
var require_util_flow_indent_check = __commonJS({
  "node_modules/yaml/dist/compose/util-flow-indent-check.js"(exports) {
    "use strict";
    var utilContainsNewline = require_util_contains_newline();
    function flowIndentCheck(indent, fc, onError) {
      if (fc?.type === "flow-collection") {
        const end = fc.end[0];
        if (end.indent === indent && (end.source === "]" || end.source === "}") && utilContainsNewline.containsNewline(fc)) {
          const msg = "Flow end indicator should be more indented than parent";
          onError(end, "BAD_INDENT", msg, true);
        }
      }
    }
    exports.flowIndentCheck = flowIndentCheck;
  }
});

// node_modules/yaml/dist/compose/util-map-includes.js
var require_util_map_includes = __commonJS({
  "node_modules/yaml/dist/compose/util-map-includes.js"(exports) {
    "use strict";
    var identity = require_identity();
    function mapIncludes(ctx, items, search) {
      const { uniqueKeys } = ctx.options;
      if (uniqueKeys === false)
        return false;
      const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a, b) => a === b || identity.isScalar(a) && identity.isScalar(b) && a.value === b.value;
      return items.some((pair) => isEqual(pair.key, search));
    }
    exports.mapIncludes = mapIncludes;
  }
});

// node_modules/yaml/dist/compose/resolve-block-map.js
var require_resolve_block_map = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-map.js"(exports) {
    "use strict";
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    var utilMapIncludes = require_util_map_includes();
    var startColMsg = "All mapping items must start at the same column";
    function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLMap.YAMLMap;
      const map = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      let offset = bm.offset;
      let commentEnd = null;
      for (const collItem of bm.items) {
        const { start, key, sep, value } = collItem;
        const keyProps = resolveProps.resolveProps(start, {
          indicator: "explicit-key-ind",
          next: key ?? sep?.[0],
          offset,
          onError,
          parentIndent: bm.indent,
          startOnNewline: true
        });
        const implicitKey = !keyProps.found;
        if (implicitKey) {
          if (key) {
            if (key.type === "block-seq")
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
            else if ("indent" in key && key.indent !== bm.indent)
              onError(offset, "BAD_INDENT", startColMsg);
          }
          if (!keyProps.anchor && !keyProps.tag && !sep) {
            commentEnd = keyProps.end;
            if (keyProps.comment) {
              if (map.comment)
                map.comment += "\n" + keyProps.comment;
              else
                map.comment = keyProps.comment;
            }
            continue;
          }
          if (keyProps.newlineAfterProp || utilContainsNewline.containsNewline(key)) {
            onError(key ?? start[start.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
          }
        } else if (keyProps.found?.indent !== bm.indent) {
          onError(offset, "BAD_INDENT", startColMsg);
        }
        ctx.atKey = true;
        const keyStart = keyProps.end;
        const keyNode = key ? composeNode(ctx, key, keyProps, onError) : composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bm.indent, key, onError);
        ctx.atKey = false;
        if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
          onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
        const valueProps = resolveProps.resolveProps(sep ?? [], {
          indicator: "map-value-ind",
          next: value,
          offset: keyNode.range[2],
          onError,
          parentIndent: bm.indent,
          startOnNewline: !key || key.type === "block-scalar"
        });
        offset = valueProps.end;
        if (valueProps.found) {
          if (implicitKey) {
            if (value?.type === "block-map" && !valueProps.hasNewline)
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
            if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
              onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : composeEmptyNode(ctx, offset, sep, null, valueProps, onError);
          if (ctx.schema.compat)
            utilFlowIndentCheck.flowIndentCheck(bm.indent, value, onError);
          offset = valueNode.range[2];
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        } else {
          if (implicitKey)
            onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
          if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        }
      }
      if (commentEnd && commentEnd < offset)
        onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
      map.range = [bm.offset, offset, commentEnd ?? offset];
      return map;
    }
    exports.resolveBlockMap = resolveBlockMap;
  }
});

// node_modules/yaml/dist/compose/resolve-block-seq.js
var require_resolve_block_seq = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-seq.js"(exports) {
    "use strict";
    var YAMLSeq = require_YAMLSeq();
    var resolveProps = require_resolve_props();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLSeq.YAMLSeq;
      const seq = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = bs.offset;
      let commentEnd = null;
      for (const { start, value } of bs.items) {
        const props = resolveProps.resolveProps(start, {
          indicator: "seq-item-ind",
          next: value,
          offset,
          onError,
          parentIndent: bs.indent,
          startOnNewline: true
        });
        if (!props.found) {
          if (props.anchor || props.tag || value) {
            if (value?.type === "block-seq")
              onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
            else
              onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
          } else {
            commentEnd = props.end;
            if (props.comment)
              seq.comment = props.comment;
            continue;
          }
        }
        const node = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, start, null, props, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bs.indent, value, onError);
        offset = node.range[2];
        seq.items.push(node);
      }
      seq.range = [bs.offset, offset, commentEnd ?? offset];
      return seq;
    }
    exports.resolveBlockSeq = resolveBlockSeq;
  }
});

// node_modules/yaml/dist/compose/resolve-end.js
var require_resolve_end = __commonJS({
  "node_modules/yaml/dist/compose/resolve-end.js"(exports) {
    "use strict";
    function resolveEnd(end, offset, reqSpace, onError) {
      let comment = "";
      if (end) {
        let hasSpace = false;
        let sep = "";
        for (const token of end) {
          const { source, type } = token;
          switch (type) {
            case "space":
              hasSpace = true;
              break;
            case "comment": {
              if (reqSpace && !hasSpace)
                onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
              const cb = source.substring(1) || " ";
              if (!comment)
                comment = cb;
              else
                comment += sep + cb;
              sep = "";
              break;
            }
            case "newline":
              if (comment)
                sep += source;
              hasSpace = true;
              break;
            default:
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type} at node end`);
          }
          offset += source.length;
        }
      }
      return { comment, offset };
    }
    exports.resolveEnd = resolveEnd;
  }
});

// node_modules/yaml/dist/compose/resolve-flow-collection.js
var require_resolve_flow_collection = __commonJS({
  "node_modules/yaml/dist/compose/resolve-flow-collection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilMapIncludes = require_util_map_includes();
    var blockMsg = "Block collections are not allowed within flow collections";
    var isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
    function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
      const isMap = fc.start.source === "{";
      const fcName = isMap ? "flow map" : "flow sequence";
      const NodeClass = tag?.nodeClass ?? (isMap ? YAMLMap.YAMLMap : YAMLSeq.YAMLSeq);
      const coll = new NodeClass(ctx.schema);
      coll.flow = true;
      const atRoot = ctx.atRoot;
      if (atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = fc.offset + fc.start.source.length;
      for (let i = 0; i < fc.items.length; ++i) {
        const collItem = fc.items[i];
        const { start, key, sep, value } = collItem;
        const props = resolveProps.resolveProps(start, {
          flow: fcName,
          indicator: "explicit-key-ind",
          next: key ?? sep?.[0],
          offset,
          onError,
          parentIndent: fc.indent,
          startOnNewline: false
        });
        if (!props.found) {
          if (!props.anchor && !props.tag && !sep && !value) {
            if (i === 0 && props.comma)
              onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
            else if (i < fc.items.length - 1)
              onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
            if (props.comment) {
              if (coll.comment)
                coll.comment += "\n" + props.comment;
              else
                coll.comment = props.comment;
            }
            offset = props.end;
            continue;
          }
          if (!isMap && ctx.options.strict && utilContainsNewline.containsNewline(key))
            onError(
              key,
              // checked by containsNewline()
              "MULTILINE_IMPLICIT_KEY",
              "Implicit keys of flow sequence pairs need to be on a single line"
            );
        }
        if (i === 0) {
          if (props.comma)
            onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
        } else {
          if (!props.comma)
            onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
          if (props.comment) {
            let prevItemComment = "";
            loop: for (const st of start) {
              switch (st.type) {
                case "comma":
                case "space":
                  break;
                case "comment":
                  prevItemComment = st.source.substring(1);
                  break loop;
                default:
                  break loop;
              }
            }
            if (prevItemComment) {
              let prev = coll.items[coll.items.length - 1];
              if (identity.isPair(prev))
                prev = prev.value ?? prev.key;
              if (prev.comment)
                prev.comment += "\n" + prevItemComment;
              else
                prev.comment = prevItemComment;
              props.comment = props.comment.substring(prevItemComment.length + 1);
            }
          }
        }
        if (!isMap && !sep && !props.found) {
          const valueNode = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, sep, null, props, onError);
          coll.items.push(valueNode);
          offset = valueNode.range[2];
          if (isBlock(value))
            onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
        } else {
          ctx.atKey = true;
          const keyStart = props.end;
          const keyNode = key ? composeNode(ctx, key, props, onError) : composeEmptyNode(ctx, keyStart, start, null, props, onError);
          if (isBlock(key))
            onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
          ctx.atKey = false;
          const valueProps = resolveProps.resolveProps(sep ?? [], {
            flow: fcName,
            indicator: "map-value-ind",
            next: value,
            offset: keyNode.range[2],
            onError,
            parentIndent: fc.indent,
            startOnNewline: false
          });
          if (valueProps.found) {
            if (!isMap && !props.found && ctx.options.strict) {
              if (sep)
                for (const st of sep) {
                  if (st === valueProps.found)
                    break;
                  if (st.type === "newline") {
                    onError(st, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                    break;
                  }
                }
              if (props.start < valueProps.found.offset - 1024)
                onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
            }
          } else if (value) {
            if ("source" in value && value.source?.[0] === ":")
              onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
            else
              onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : valueProps.found ? composeEmptyNode(ctx, valueProps.end, sep, null, valueProps, onError) : null;
          if (valueNode) {
            if (isBlock(value))
              onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
          } else if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          if (isMap) {
            const map = coll;
            if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
              onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
            map.items.push(pair);
          } else {
            const map = new YAMLMap.YAMLMap(ctx.schema);
            map.flow = true;
            map.items.push(pair);
            const endRange = (valueNode ?? keyNode).range;
            map.range = [keyNode.range[0], endRange[1], endRange[2]];
            coll.items.push(map);
          }
          offset = valueNode ? valueNode.range[2] : valueProps.end;
        }
      }
      const expectedEnd = isMap ? "}" : "]";
      const [ce, ...ee] = fc.end;
      let cePos = offset;
      if (ce?.source === expectedEnd)
        cePos = ce.offset + ce.source.length;
      else {
        const name = fcName[0].toUpperCase() + fcName.substring(1);
        const msg = atRoot ? `${name} must end with a ${expectedEnd}` : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
        onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
        if (ce && ce.source.length !== 1)
          ee.unshift(ce);
      }
      if (ee.length > 0) {
        const end = resolveEnd.resolveEnd(ee, cePos, ctx.options.strict, onError);
        if (end.comment) {
          if (coll.comment)
            coll.comment += "\n" + end.comment;
          else
            coll.comment = end.comment;
        }
        coll.range = [fc.offset, cePos, end.offset];
      } else {
        coll.range = [fc.offset, cePos, cePos];
      }
      return coll;
    }
    exports.resolveFlowCollection = resolveFlowCollection;
  }
});

// node_modules/yaml/dist/compose/compose-collection.js
var require_compose_collection = __commonJS({
  "node_modules/yaml/dist/compose/compose-collection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveBlockMap = require_resolve_block_map();
    var resolveBlockSeq = require_resolve_block_seq();
    var resolveFlowCollection = require_resolve_flow_collection();
    function resolveCollection(CN, ctx, token, onError, tagName, tag) {
      const coll = token.type === "block-map" ? resolveBlockMap.resolveBlockMap(CN, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq.resolveBlockSeq(CN, ctx, token, onError, tag) : resolveFlowCollection.resolveFlowCollection(CN, ctx, token, onError, tag);
      const Coll = coll.constructor;
      if (tagName === "!" || tagName === Coll.tagName) {
        coll.tag = Coll.tagName;
        return coll;
      }
      if (tagName)
        coll.tag = tagName;
      return coll;
    }
    function composeCollection(CN, ctx, token, props, onError) {
      const tagToken = props.tag;
      const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
      if (token.type === "block-seq") {
        const { anchor, newlineAfterProp: nl } = props;
        const lastProp = anchor && tagToken ? anchor.offset > tagToken.offset ? anchor : tagToken : anchor ?? tagToken;
        if (lastProp && (!nl || nl.offset < lastProp.offset)) {
          const message = "Missing newline after block sequence props";
          onError(lastProp, "MISSING_CHAR", message);
        }
      }
      const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
      if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap.YAMLMap.tagName && expType === "map" || tagName === YAMLSeq.YAMLSeq.tagName && expType === "seq") {
        return resolveCollection(CN, ctx, token, onError, tagName);
      }
      let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
      if (!tag) {
        const kt = ctx.schema.knownTags[tagName];
        if (kt?.collection === expType) {
          ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
          tag = kt;
        } else {
          if (kt) {
            onError(tagToken, "BAD_COLLECTION_TYPE", `${kt.tag} used for ${expType} collection, but expects ${kt.collection ?? "scalar"}`, true);
          } else {
            onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
          }
          return resolveCollection(CN, ctx, token, onError, tagName);
        }
      }
      const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
      const res = tag.resolve?.(coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options) ?? coll;
      const node = identity.isNode(res) ? res : new Scalar.Scalar(res);
      node.range = coll.range;
      node.tag = tagName;
      if (tag?.format)
        node.format = tag.format;
      return node;
    }
    exports.composeCollection = composeCollection;
  }
});

// node_modules/yaml/dist/compose/resolve-block-scalar.js
var require_resolve_block_scalar = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-scalar.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    function resolveBlockScalar(ctx, scalar, onError) {
      const start = scalar.offset;
      const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
      if (!header)
        return { value: "", type: null, comment: "", range: [start, start, start] };
      const type = header.mode === ">" ? Scalar.Scalar.BLOCK_FOLDED : Scalar.Scalar.BLOCK_LITERAL;
      const lines = scalar.source ? splitLines(scalar.source) : [];
      let chompStart = lines.length;
      for (let i = lines.length - 1; i >= 0; --i) {
        const content = lines[i][1];
        if (content === "" || content === "\r")
          chompStart = i;
        else
          break;
      }
      if (chompStart === 0) {
        const value2 = header.chomp === "+" && lines.length > 0 ? "\n".repeat(Math.max(1, lines.length - 1)) : "";
        let end2 = start + header.length;
        if (scalar.source)
          end2 += scalar.source.length;
        return { value: value2, type, comment: header.comment, range: [start, end2, end2] };
      }
      let trimIndent = scalar.indent + header.indent;
      let offset = scalar.offset + header.length;
      let contentStart = 0;
      for (let i = 0; i < chompStart; ++i) {
        const [indent, content] = lines[i];
        if (content === "" || content === "\r") {
          if (header.indent === 0 && indent.length > trimIndent)
            trimIndent = indent.length;
        } else {
          if (indent.length < trimIndent) {
            const message = "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
            onError(offset + indent.length, "MISSING_CHAR", message);
          }
          if (header.indent === 0)
            trimIndent = indent.length;
          contentStart = i;
          if (trimIndent === 0 && !ctx.atRoot) {
            const message = "Block scalar values in collections must be indented";
            onError(offset, "BAD_INDENT", message);
          }
          break;
        }
        offset += indent.length + content.length + 1;
      }
      for (let i = lines.length - 1; i >= chompStart; --i) {
        if (lines[i][0].length > trimIndent)
          chompStart = i + 1;
      }
      let value = "";
      let sep = "";
      let prevMoreIndented = false;
      for (let i = 0; i < contentStart; ++i)
        value += lines[i][0].slice(trimIndent) + "\n";
      for (let i = contentStart; i < chompStart; ++i) {
        let [indent, content] = lines[i];
        offset += indent.length + content.length + 1;
        const crlf = content[content.length - 1] === "\r";
        if (crlf)
          content = content.slice(0, -1);
        if (content && indent.length < trimIndent) {
          const src = header.indent ? "explicit indentation indicator" : "first line";
          const message = `Block scalar lines must not be less indented than their ${src}`;
          onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
          indent = "";
        }
        if (type === Scalar.Scalar.BLOCK_LITERAL) {
          value += sep + indent.slice(trimIndent) + content;
          sep = "\n";
        } else if (indent.length > trimIndent || content[0] === "	") {
          if (sep === " ")
            sep = "\n";
          else if (!prevMoreIndented && sep === "\n")
            sep = "\n\n";
          value += sep + indent.slice(trimIndent) + content;
          sep = "\n";
          prevMoreIndented = true;
        } else if (content === "") {
          if (sep === "\n")
            value += "\n";
          else
            sep = "\n";
        } else {
          value += sep + content;
          sep = " ";
          prevMoreIndented = false;
        }
      }
      switch (header.chomp) {
        case "-":
          break;
        case "+":
          for (let i = chompStart; i < lines.length; ++i)
            value += "\n" + lines[i][0].slice(trimIndent);
          if (value[value.length - 1] !== "\n")
            value += "\n";
          break;
        default:
          value += "\n";
      }
      const end = start + header.length + scalar.source.length;
      return { value, type, comment: header.comment, range: [start, end, end] };
    }
    function parseBlockScalarHeader({ offset, props }, strict, onError) {
      if (props[0].type !== "block-scalar-header") {
        onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
        return null;
      }
      const { source } = props[0];
      const mode = source[0];
      let indent = 0;
      let chomp = "";
      let error = -1;
      for (let i = 1; i < source.length; ++i) {
        const ch = source[i];
        if (!chomp && (ch === "-" || ch === "+"))
          chomp = ch;
        else {
          const n = Number(ch);
          if (!indent && n)
            indent = n;
          else if (error === -1)
            error = offset + i;
        }
      }
      if (error !== -1)
        onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
      let hasSpace = false;
      let comment = "";
      let length = source.length;
      for (let i = 1; i < props.length; ++i) {
        const token = props[i];
        switch (token.type) {
          case "space":
            hasSpace = true;
          // fallthrough
          case "newline":
            length += token.source.length;
            break;
          case "comment":
            if (strict && !hasSpace) {
              const message = "Comments must be separated from other tokens by white space characters";
              onError(token, "MISSING_CHAR", message);
            }
            length += token.source.length;
            comment = token.source.substring(1);
            break;
          case "error":
            onError(token, "UNEXPECTED_TOKEN", token.message);
            length += token.source.length;
            break;
          /* istanbul ignore next should not happen */
          default: {
            const message = `Unexpected token in block scalar header: ${token.type}`;
            onError(token, "UNEXPECTED_TOKEN", message);
            const ts = token.source;
            if (ts && typeof ts === "string")
              length += ts.length;
          }
        }
      }
      return { mode, indent, chomp, comment, length };
    }
    function splitLines(source) {
      const split = source.split(/\n( *)/);
      const first = split[0];
      const m = first.match(/^( *)/);
      const line0 = m?.[1] ? [m[1], first.slice(m[1].length)] : ["", first];
      const lines = [line0];
      for (let i = 1; i < split.length; i += 2)
        lines.push([split[i], split[i + 1]]);
      return lines;
    }
    exports.resolveBlockScalar = resolveBlockScalar;
  }
});

// node_modules/yaml/dist/compose/resolve-flow-scalar.js
var require_resolve_flow_scalar = __commonJS({
  "node_modules/yaml/dist/compose/resolve-flow-scalar.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var resolveEnd = require_resolve_end();
    function resolveFlowScalar(scalar, strict, onError) {
      const { offset, type, source, end } = scalar;
      let _type;
      let value;
      const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
      switch (type) {
        case "scalar":
          _type = Scalar.Scalar.PLAIN;
          value = plainValue(source, _onError);
          break;
        case "single-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_SINGLE;
          value = singleQuotedValue(source, _onError);
          break;
        case "double-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_DOUBLE;
          value = doubleQuotedValue(source, _onError);
          break;
        /* istanbul ignore next should not happen */
        default:
          onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type}`);
          return {
            value: "",
            type: null,
            comment: "",
            range: [offset, offset + source.length, offset + source.length]
          };
      }
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, strict, onError);
      return {
        value,
        type: _type,
        comment: re.comment,
        range: [offset, valueEnd, re.offset]
      };
    }
    function plainValue(source, onError) {
      let badChar = "";
      switch (source[0]) {
        /* istanbul ignore next should not happen */
        case "	":
          badChar = "a tab character";
          break;
        case ",":
          badChar = "flow indicator character ,";
          break;
        case "%":
          badChar = "directive indicator character %";
          break;
        case "|":
        case ">": {
          badChar = `block scalar indicator ${source[0]}`;
          break;
        }
        case "@":
        case "`": {
          badChar = `reserved character ${source[0]}`;
          break;
        }
      }
      if (badChar)
        onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
      return foldLines(source);
    }
    function singleQuotedValue(source, onError) {
      if (source[source.length - 1] !== "'" || source.length === 1)
        onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
      return foldLines(source.slice(1, -1)).replace(/''/g, "'");
    }
    function foldLines(source) {
      let first, line;
      try {
        first = new RegExp("(.*?)(?<![ 	])[ 	]*\r?\n", "sy");
        line = new RegExp("[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?\n", "sy");
      } catch {
        first = /(.*?)[ \t]*\r?\n/sy;
        line = /[ \t]*(.*?)[ \t]*\r?\n/sy;
      }
      let match = first.exec(source);
      if (!match)
        return source;
      let res = match[1];
      let sep = " ";
      let pos = first.lastIndex;
      line.lastIndex = pos;
      while (match = line.exec(source)) {
        if (match[1] === "") {
          if (sep === "\n")
            res += sep;
          else
            sep = "\n";
        } else {
          res += sep + match[1];
          sep = " ";
        }
        pos = line.lastIndex;
      }
      const last = /[ \t]*(.*)/sy;
      last.lastIndex = pos;
      match = last.exec(source);
      return res + sep + (match?.[1] ?? "");
    }
    function doubleQuotedValue(source, onError) {
      let res = "";
      for (let i = 1; i < source.length - 1; ++i) {
        const ch = source[i];
        if (ch === "\r" && source[i + 1] === "\n")
          continue;
        if (ch === "\n") {
          const { fold, offset } = foldNewline(source, i);
          res += fold;
          i = offset;
        } else if (ch === "\\") {
          let next = source[++i];
          const cc = escapeCodes[next];
          if (cc)
            res += cc;
          else if (next === "\n") {
            next = source[i + 1];
            while (next === " " || next === "	")
              next = source[++i + 1];
          } else if (next === "\r" && source[i + 1] === "\n") {
            next = source[++i + 1];
            while (next === " " || next === "	")
              next = source[++i + 1];
          } else if (next === "x" || next === "u" || next === "U") {
            const length = next === "x" ? 2 : next === "u" ? 4 : 8;
            res += parseCharCode(source, i + 1, length, onError);
            i += length;
          } else {
            const raw = source.substr(i - 1, 2);
            onError(i - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
            res += raw;
          }
        } else if (ch === " " || ch === "	") {
          const wsStart = i;
          let next = source[i + 1];
          while (next === " " || next === "	")
            next = source[++i + 1];
          if (next !== "\n" && !(next === "\r" && source[i + 2] === "\n"))
            res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
        } else {
          res += ch;
        }
      }
      if (source[source.length - 1] !== '"' || source.length === 1)
        onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
      return res;
    }
    function foldNewline(source, offset) {
      let fold = "";
      let ch = source[offset + 1];
      while (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
        if (ch === "\r" && source[offset + 2] !== "\n")
          break;
        if (ch === "\n")
          fold += "\n";
        offset += 1;
        ch = source[offset + 1];
      }
      if (!fold)
        fold = " ";
      return { fold, offset };
    }
    var escapeCodes = {
      "0": "\0",
      // null character
      a: "\x07",
      // bell character
      b: "\b",
      // backspace
      e: "\x1B",
      // escape character
      f: "\f",
      // form feed
      n: "\n",
      // line feed
      r: "\r",
      // carriage return
      t: "	",
      // horizontal tab
      v: "\v",
      // vertical tab
      N: "\x85",
      // Unicode next line
      _: "\xA0",
      // Unicode non-breaking space
      L: "\u2028",
      // Unicode line separator
      P: "\u2029",
      // Unicode paragraph separator
      " ": " ",
      '"': '"',
      "/": "/",
      "\\": "\\",
      "	": "	"
    };
    function parseCharCode(source, offset, length, onError) {
      const cc = source.substr(offset, length);
      const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
      const code = ok ? parseInt(cc, 16) : NaN;
      try {
        return String.fromCodePoint(code);
      } catch {
        const raw = source.substr(offset - 2, length + 2);
        onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
        return raw;
      }
    }
    exports.resolveFlowScalar = resolveFlowScalar;
  }
});

// node_modules/yaml/dist/compose/compose-scalar.js
var require_compose_scalar = __commonJS({
  "node_modules/yaml/dist/compose/compose-scalar.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    function composeScalar(ctx, token, tagToken, onError) {
      const { value, type, comment, range } = token.type === "block-scalar" ? resolveBlockScalar.resolveBlockScalar(ctx, token, onError) : resolveFlowScalar.resolveFlowScalar(token, ctx.options.strict, onError);
      const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
      let tag;
      if (ctx.options.stringKeys && ctx.atKey) {
        tag = ctx.schema[identity.SCALAR];
      } else if (tagName)
        tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
      else if (token.type === "scalar")
        tag = findScalarTagByTest(ctx, value, token, onError);
      else
        tag = ctx.schema[identity.SCALAR];
      let scalar;
      try {
        const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
        scalar = identity.isScalar(res) ? res : new Scalar.Scalar(res);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
        scalar = new Scalar.Scalar(value);
      }
      scalar.range = range;
      scalar.source = value;
      if (type)
        scalar.type = type;
      if (tagName)
        scalar.tag = tagName;
      if (tag.format)
        scalar.format = tag.format;
      if (comment)
        scalar.comment = comment;
      return scalar;
    }
    function findScalarTagByName(schema, value, tagName, tagToken, onError) {
      if (tagName === "!")
        return schema[identity.SCALAR];
      const matchWithTest = [];
      for (const tag of schema.tags) {
        if (!tag.collection && tag.tag === tagName) {
          if (tag.default && tag.test)
            matchWithTest.push(tag);
          else
            return tag;
        }
      }
      for (const tag of matchWithTest)
        if (tag.test?.test(value))
          return tag;
      const kt = schema.knownTags[tagName];
      if (kt && !kt.collection) {
        schema.tags.push(Object.assign({}, kt, { default: false, test: void 0 }));
        return kt;
      }
      onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
      return schema[identity.SCALAR];
    }
    function findScalarTagByTest({ atKey, directives, schema }, value, token, onError) {
      const tag = schema.tags.find((tag2) => (tag2.default === true || atKey && tag2.default === "key") && tag2.test?.test(value)) || schema[identity.SCALAR];
      if (schema.compat) {
        const compat = schema.compat.find((tag2) => tag2.default && tag2.test?.test(value)) ?? schema[identity.SCALAR];
        if (tag.tag !== compat.tag) {
          const ts = directives.tagString(tag.tag);
          const cs = directives.tagString(compat.tag);
          const msg = `Value may be parsed as either ${ts} or ${cs}`;
          onError(token, "TAG_RESOLVE_FAILED", msg, true);
        }
      }
      return tag;
    }
    exports.composeScalar = composeScalar;
  }
});

// node_modules/yaml/dist/compose/util-empty-scalar-position.js
var require_util_empty_scalar_position = __commonJS({
  "node_modules/yaml/dist/compose/util-empty-scalar-position.js"(exports) {
    "use strict";
    function emptyScalarPosition(offset, before, pos) {
      if (before) {
        pos ?? (pos = before.length);
        for (let i = pos - 1; i >= 0; --i) {
          let st = before[i];
          switch (st.type) {
            case "space":
            case "comment":
            case "newline":
              offset -= st.source.length;
              continue;
          }
          st = before[++i];
          while (st?.type === "space") {
            offset += st.source.length;
            st = before[++i];
          }
          break;
        }
      }
      return offset;
    }
    exports.emptyScalarPosition = emptyScalarPosition;
  }
});

// node_modules/yaml/dist/compose/compose-node.js
var require_compose_node = __commonJS({
  "node_modules/yaml/dist/compose/compose-node.js"(exports) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var composeCollection = require_compose_collection();
    var composeScalar = require_compose_scalar();
    var resolveEnd = require_resolve_end();
    var utilEmptyScalarPosition = require_util_empty_scalar_position();
    var CN = { composeNode, composeEmptyNode };
    function composeNode(ctx, token, props, onError) {
      const atKey = ctx.atKey;
      const { spaceBefore, comment, anchor, tag } = props;
      let node;
      let isSrcToken = true;
      switch (token.type) {
        case "alias":
          node = composeAlias(ctx, token, onError);
          if (anchor || tag)
            onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
          break;
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "block-scalar":
          node = composeScalar.composeScalar(ctx, token, tag, onError);
          if (anchor)
            node.anchor = anchor.source.substring(1);
          break;
        case "block-map":
        case "block-seq":
        case "flow-collection":
          try {
            node = composeCollection.composeCollection(CN, ctx, token, props, onError);
            if (anchor)
              node.anchor = anchor.source.substring(1);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            onError(token, "RESOURCE_EXHAUSTION", message);
          }
          break;
        default: {
          const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
          onError(token, "UNEXPECTED_TOKEN", message);
          isSrcToken = false;
        }
      }
      node ?? (node = composeEmptyNode(ctx, token.offset, void 0, null, props, onError));
      if (anchor && node.anchor === "")
        onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      if (atKey && ctx.options.stringKeys && (!identity.isScalar(node) || typeof node.value !== "string" || node.tag && node.tag !== "tag:yaml.org,2002:str")) {
        const msg = "With stringKeys, all keys must be strings";
        onError(tag ?? token, "NON_STRING_KEY", msg);
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        if (token.type === "scalar" && token.source === "")
          node.comment = comment;
        else
          node.commentBefore = comment;
      }
      if (ctx.options.keepSourceTokens && isSrcToken)
        node.srcToken = token;
      return node;
    }
    function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
      const token = {
        type: "scalar",
        offset: utilEmptyScalarPosition.emptyScalarPosition(offset, before, pos),
        indent: -1,
        source: ""
      };
      const node = composeScalar.composeScalar(ctx, token, tag, onError);
      if (anchor) {
        node.anchor = anchor.source.substring(1);
        if (node.anchor === "")
          onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        node.comment = comment;
        node.range[2] = end;
      }
      return node;
    }
    function composeAlias({ options }, { offset, source, end }, onError) {
      const alias = new Alias.Alias(source.substring(1));
      if (alias.source === "")
        onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
      if (alias.source.endsWith(":"))
        onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, options.strict, onError);
      alias.range = [offset, valueEnd, re.offset];
      if (re.comment)
        alias.comment = re.comment;
      return alias;
    }
    exports.composeEmptyNode = composeEmptyNode;
    exports.composeNode = composeNode;
  }
});

// node_modules/yaml/dist/compose/compose-doc.js
var require_compose_doc = __commonJS({
  "node_modules/yaml/dist/compose/compose-doc.js"(exports) {
    "use strict";
    var Document = require_Document();
    var composeNode = require_compose_node();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    function composeDoc(options, directives, { offset, start, value, end }, onError) {
      const opts = Object.assign({ _directives: directives }, options);
      const doc = new Document.Document(void 0, opts);
      const ctx = {
        atKey: false,
        atRoot: true,
        directives: doc.directives,
        options: doc.options,
        schema: doc.schema
      };
      const props = resolveProps.resolveProps(start, {
        indicator: "doc-start",
        next: value ?? end?.[0],
        offset,
        onError,
        parentIndent: 0,
        startOnNewline: true
      });
      if (props.found) {
        doc.directives.docStart = true;
        if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline)
          onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
      }
      doc.contents = value ? composeNode.composeNode(ctx, value, props, onError) : composeNode.composeEmptyNode(ctx, props.end, start, null, props, onError);
      const contentEnd = doc.contents.range[2];
      const re = resolveEnd.resolveEnd(end, contentEnd, false, onError);
      if (re.comment)
        doc.comment = re.comment;
      doc.range = [offset, contentEnd, re.offset];
      return doc;
    }
    exports.composeDoc = composeDoc;
  }
});

// node_modules/yaml/dist/compose/composer.js
var require_composer = __commonJS({
  "node_modules/yaml/dist/compose/composer.js"(exports) {
    "use strict";
    var node_process = __require("process");
    var directives = require_directives();
    var Document = require_Document();
    var errors = require_errors();
    var identity = require_identity();
    var composeDoc = require_compose_doc();
    var resolveEnd = require_resolve_end();
    function getErrorPos(src) {
      if (typeof src === "number")
        return [src, src + 1];
      if (Array.isArray(src))
        return src.length === 2 ? src : [src[0], src[1]];
      const { offset, source } = src;
      return [offset, offset + (typeof source === "string" ? source.length : 1)];
    }
    function parsePrelude(prelude) {
      let comment = "";
      let atComment = false;
      let afterEmptyLine = false;
      for (let i = 0; i < prelude.length; ++i) {
        const source = prelude[i];
        switch (source[0]) {
          case "#":
            comment += (comment === "" ? "" : afterEmptyLine ? "\n\n" : "\n") + (source.substring(1) || " ");
            atComment = true;
            afterEmptyLine = false;
            break;
          case "%":
            if (prelude[i + 1]?.[0] !== "#")
              i += 1;
            atComment = false;
            break;
          default:
            if (!atComment)
              afterEmptyLine = true;
            atComment = false;
        }
      }
      return { comment, afterEmptyLine };
    }
    var Composer = class {
      constructor(options = {}) {
        this.doc = null;
        this.atDirectives = false;
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
        this.onError = (source, code, message, warning) => {
          const pos = getErrorPos(source);
          if (warning)
            this.warnings.push(new errors.YAMLWarning(pos, code, message));
          else
            this.errors.push(new errors.YAMLParseError(pos, code, message));
        };
        this.directives = new directives.Directives({ version: options.version || "1.2" });
        this.options = options;
      }
      decorate(doc, afterDoc) {
        const { comment, afterEmptyLine } = parsePrelude(this.prelude);
        if (comment) {
          const dc = doc.contents;
          if (afterDoc) {
            doc.comment = doc.comment ? `${doc.comment}
${comment}` : comment;
          } else if (afterEmptyLine || doc.directives.docStart || !dc) {
            doc.commentBefore = comment;
          } else if (identity.isCollection(dc) && !dc.flow && dc.items.length > 0) {
            let it = dc.items[0];
            if (identity.isPair(it))
              it = it.key;
            const cb = it.commentBefore;
            it.commentBefore = cb ? `${comment}
${cb}` : comment;
          } else {
            const cb = dc.commentBefore;
            dc.commentBefore = cb ? `${comment}
${cb}` : comment;
          }
        }
        if (afterDoc) {
          for (let i = 0; i < this.errors.length; ++i)
            doc.errors.push(this.errors[i]);
          for (let i = 0; i < this.warnings.length; ++i)
            doc.warnings.push(this.warnings[i]);
        } else {
          doc.errors = this.errors;
          doc.warnings = this.warnings;
        }
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
      }
      /**
       * Current stream status information.
       *
       * Mostly useful at the end of input for an empty stream.
       */
      streamInfo() {
        return {
          comment: parsePrelude(this.prelude).comment,
          directives: this.directives,
          errors: this.errors,
          warnings: this.warnings
        };
      }
      /**
       * Compose tokens into documents.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *compose(tokens, forceDoc = false, endOffset = -1) {
        for (const token of tokens)
          yield* this.next(token);
        yield* this.end(forceDoc, endOffset);
      }
      /** Advance the composer by one CST token. */
      *next(token) {
        if (node_process.env.LOG_STREAM)
          console.dir(token, { depth: null });
        switch (token.type) {
          case "directive":
            this.directives.add(token.source, (offset, message, warning) => {
              const pos = getErrorPos(token);
              pos[0] += offset;
              this.onError(pos, "BAD_DIRECTIVE", message, warning);
            });
            this.prelude.push(token.source);
            this.atDirectives = true;
            break;
          case "document": {
            const doc = composeDoc.composeDoc(this.options, this.directives, token, this.onError);
            if (this.atDirectives && !doc.directives.docStart)
              this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
            this.decorate(doc, false);
            if (this.doc)
              yield this.doc;
            this.doc = doc;
            this.atDirectives = false;
            break;
          }
          case "byte-order-mark":
          case "space":
            break;
          case "comment":
          case "newline":
            this.prelude.push(token.source);
            break;
          case "error": {
            const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
            const error = new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
            if (this.atDirectives || !this.doc)
              this.errors.push(error);
            else
              this.doc.errors.push(error);
            break;
          }
          case "doc-end": {
            if (!this.doc) {
              const msg = "Unexpected doc-end without preceding document";
              this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg));
              break;
            }
            this.doc.directives.docEnd = true;
            const end = resolveEnd.resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
            this.decorate(this.doc, true);
            if (end.comment) {
              const dc = this.doc.comment;
              this.doc.comment = dc ? `${dc}
${end.comment}` : end.comment;
            }
            this.doc.range[2] = end.offset;
            break;
          }
          default:
            this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
        }
      }
      /**
       * Call at end of input to yield any remaining document.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *end(forceDoc = false, endOffset = -1) {
        if (this.doc) {
          this.decorate(this.doc, true);
          yield this.doc;
          this.doc = null;
        } else if (forceDoc) {
          const opts = Object.assign({ _directives: this.directives }, this.options);
          const doc = new Document.Document(void 0, opts);
          if (this.atDirectives)
            this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
          doc.range = [0, endOffset, endOffset];
          this.decorate(doc, false);
          yield doc;
        }
      }
    };
    exports.Composer = Composer;
  }
});

// node_modules/yaml/dist/parse/cst-scalar.js
var require_cst_scalar = __commonJS({
  "node_modules/yaml/dist/parse/cst-scalar.js"(exports) {
    "use strict";
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    var errors = require_errors();
    var stringifyString = require_stringifyString();
    function resolveAsScalar(token, strict = true, onError) {
      if (token) {
        const _onError = (pos, code, message) => {
          const offset = typeof pos === "number" ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
          if (onError)
            onError(offset, code, message);
          else
            throw new errors.YAMLParseError([offset, offset + 1], code, message);
        };
        switch (token.type) {
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return resolveFlowScalar.resolveFlowScalar(token, strict, _onError);
          case "block-scalar":
            return resolveBlockScalar.resolveBlockScalar({ options: { strict } }, token, _onError);
        }
      }
      return null;
    }
    function createScalarToken(value, context) {
      const { implicitKey = false, indent, inFlow = false, offset = -1, type = "PLAIN" } = context;
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey,
        indent: indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      const end = context.end ?? [
        { type: "newline", offset: -1, indent, source: "\n" }
      ];
      switch (source[0]) {
        case "|":
        case ">": {
          const he = source.indexOf("\n");
          const head = source.substring(0, he);
          const body = source.substring(he + 1) + "\n";
          const props = [
            { type: "block-scalar-header", offset, indent, source: head }
          ];
          if (!addEndtoBlockProps(props, end))
            props.push({ type: "newline", offset: -1, indent, source: "\n" });
          return { type: "block-scalar", offset, indent, props, source: body };
        }
        case '"':
          return { type: "double-quoted-scalar", offset, indent, source, end };
        case "'":
          return { type: "single-quoted-scalar", offset, indent, source, end };
        default:
          return { type: "scalar", offset, indent, source, end };
      }
    }
    function setScalarValue(token, value, context = {}) {
      let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
      let indent = "indent" in token ? token.indent : null;
      if (afterKey && typeof indent === "number")
        indent += 2;
      if (!type)
        switch (token.type) {
          case "single-quoted-scalar":
            type = "QUOTE_SINGLE";
            break;
          case "double-quoted-scalar":
            type = "QUOTE_DOUBLE";
            break;
          case "block-scalar": {
            const header = token.props[0];
            if (header.type !== "block-scalar-header")
              throw new Error("Invalid block scalar header");
            type = header.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
            break;
          }
          default:
            type = "PLAIN";
        }
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey: implicitKey || indent === null,
        indent: indent !== null && indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      switch (source[0]) {
        case "|":
        case ">":
          setBlockScalarValue(token, source);
          break;
        case '"':
          setFlowScalarValue(token, source, "double-quoted-scalar");
          break;
        case "'":
          setFlowScalarValue(token, source, "single-quoted-scalar");
          break;
        default:
          setFlowScalarValue(token, source, "scalar");
      }
    }
    function setBlockScalarValue(token, source) {
      const he = source.indexOf("\n");
      const head = source.substring(0, he);
      const body = source.substring(he + 1) + "\n";
      if (token.type === "block-scalar") {
        const header = token.props[0];
        if (header.type !== "block-scalar-header")
          throw new Error("Invalid block scalar header");
        header.source = head;
        token.source = body;
      } else {
        const { offset } = token;
        const indent = "indent" in token ? token.indent : -1;
        const props = [
          { type: "block-scalar-header", offset, indent, source: head }
        ];
        if (!addEndtoBlockProps(props, "end" in token ? token.end : void 0))
          props.push({ type: "newline", offset: -1, indent, source: "\n" });
        for (const key of Object.keys(token))
          if (key !== "type" && key !== "offset")
            delete token[key];
        Object.assign(token, { type: "block-scalar", indent, props, source: body });
      }
    }
    function addEndtoBlockProps(props, end) {
      if (end)
        for (const st of end)
          switch (st.type) {
            case "space":
            case "comment":
              props.push(st);
              break;
            case "newline":
              props.push(st);
              return true;
          }
      return false;
    }
    function setFlowScalarValue(token, source, type) {
      switch (token.type) {
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          token.type = type;
          token.source = source;
          break;
        case "block-scalar": {
          const end = token.props.slice(1);
          let oa = source.length;
          if (token.props[0].type === "block-scalar-header")
            oa -= token.props[0].source.length;
          for (const tok of end)
            tok.offset += oa;
          delete token.props;
          Object.assign(token, { type, source, end });
          break;
        }
        case "block-map":
        case "block-seq": {
          const offset = token.offset + source.length;
          const nl = { type: "newline", offset, indent: token.indent, source: "\n" };
          delete token.items;
          Object.assign(token, { type, source, end: [nl] });
          break;
        }
        default: {
          const indent = "indent" in token ? token.indent : -1;
          const end = "end" in token && Array.isArray(token.end) ? token.end.filter((st) => st.type === "space" || st.type === "comment" || st.type === "newline") : [];
          for (const key of Object.keys(token))
            if (key !== "type" && key !== "offset")
              delete token[key];
          Object.assign(token, { type, indent, source, end });
        }
      }
    }
    exports.createScalarToken = createScalarToken;
    exports.resolveAsScalar = resolveAsScalar;
    exports.setScalarValue = setScalarValue;
  }
});

// node_modules/yaml/dist/parse/cst-stringify.js
var require_cst_stringify = __commonJS({
  "node_modules/yaml/dist/parse/cst-stringify.js"(exports) {
    "use strict";
    var stringify = (cst) => "type" in cst ? stringifyToken(cst) : stringifyItem(cst);
    function stringifyToken(token) {
      switch (token.type) {
        case "block-scalar": {
          let res = "";
          for (const tok of token.props)
            res += stringifyToken(tok);
          return res + token.source;
        }
        case "block-map":
        case "block-seq": {
          let res = "";
          for (const item of token.items)
            res += stringifyItem(item);
          return res;
        }
        case "flow-collection": {
          let res = token.start.source;
          for (const item of token.items)
            res += stringifyItem(item);
          for (const st of token.end)
            res += st.source;
          return res;
        }
        case "document": {
          let res = stringifyItem(token);
          if (token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
        default: {
          let res = token.source;
          if ("end" in token && token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
      }
    }
    function stringifyItem({ start, key, sep, value }) {
      let res = "";
      for (const st of start)
        res += st.source;
      if (key)
        res += stringifyToken(key);
      if (sep)
        for (const st of sep)
          res += st.source;
      if (value)
        res += stringifyToken(value);
      return res;
    }
    exports.stringify = stringify;
  }
});

// node_modules/yaml/dist/parse/cst-visit.js
var require_cst_visit = __commonJS({
  "node_modules/yaml/dist/parse/cst-visit.js"(exports) {
    "use strict";
    var BREAK = /* @__PURE__ */ Symbol("break visit");
    var SKIP = /* @__PURE__ */ Symbol("skip children");
    var REMOVE = /* @__PURE__ */ Symbol("remove item");
    function visit(cst, visitor) {
      if ("type" in cst && cst.type === "document")
        cst = { start: cst.start, value: cst.value };
      _visit(Object.freeze([]), cst, visitor);
    }
    visit.BREAK = BREAK;
    visit.SKIP = SKIP;
    visit.REMOVE = REMOVE;
    visit.itemAtPath = (cst, path) => {
      let item = cst;
      for (const [field, index] of path) {
        const tok = item?.[field];
        if (tok && "items" in tok) {
          item = tok.items[index];
        } else
          return void 0;
      }
      return item;
    };
    visit.parentCollection = (cst, path) => {
      const parent = visit.itemAtPath(cst, path.slice(0, -1));
      const field = path[path.length - 1][0];
      const coll = parent?.[field];
      if (coll && "items" in coll)
        return coll;
      throw new Error("Parent collection not found");
    };
    function _visit(path, item, visitor) {
      let ctrl = visitor(item, path);
      if (typeof ctrl === "symbol")
        return ctrl;
      for (const field of ["key", "value"]) {
        const token = item[field];
        if (token && "items" in token) {
          for (let i = 0; i < token.items.length; ++i) {
            const ci = _visit(Object.freeze(path.concat([[field, i]])), token.items[i], visitor);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              token.items.splice(i, 1);
              i -= 1;
            }
          }
          if (typeof ctrl === "function" && field === "key")
            ctrl = ctrl(item, path);
        }
      }
      return typeof ctrl === "function" ? ctrl(item, path) : ctrl;
    }
    exports.visit = visit;
  }
});

// node_modules/yaml/dist/parse/cst.js
var require_cst = __commonJS({
  "node_modules/yaml/dist/parse/cst.js"(exports) {
    "use strict";
    var cstScalar = require_cst_scalar();
    var cstStringify = require_cst_stringify();
    var cstVisit = require_cst_visit();
    var BOM = "\uFEFF";
    var DOCUMENT = "";
    var FLOW_END = "";
    var SCALAR = "";
    var isCollection = (token) => !!token && "items" in token;
    var isScalar = (token) => !!token && (token.type === "scalar" || token.type === "single-quoted-scalar" || token.type === "double-quoted-scalar" || token.type === "block-scalar");
    function prettyToken(token) {
      switch (token) {
        case BOM:
          return "<BOM>";
        case DOCUMENT:
          return "<DOC>";
        case FLOW_END:
          return "<FLOW_END>";
        case SCALAR:
          return "<SCALAR>";
        default:
          return JSON.stringify(token);
      }
    }
    function tokenType(source) {
      switch (source) {
        case BOM:
          return "byte-order-mark";
        case DOCUMENT:
          return "doc-mode";
        case FLOW_END:
          return "flow-error-end";
        case SCALAR:
          return "scalar";
        case "---":
          return "doc-start";
        case "...":
          return "doc-end";
        case "":
        case "\n":
        case "\r\n":
          return "newline";
        case "-":
          return "seq-item-ind";
        case "?":
          return "explicit-key-ind";
        case ":":
          return "map-value-ind";
        case "{":
          return "flow-map-start";
        case "}":
          return "flow-map-end";
        case "[":
          return "flow-seq-start";
        case "]":
          return "flow-seq-end";
        case ",":
          return "comma";
      }
      switch (source[0]) {
        case " ":
        case "	":
          return "space";
        case "#":
          return "comment";
        case "%":
          return "directive-line";
        case "*":
          return "alias";
        case "&":
          return "anchor";
        case "!":
          return "tag";
        case "'":
          return "single-quoted-scalar";
        case '"':
          return "double-quoted-scalar";
        case "|":
        case ">":
          return "block-scalar-header";
      }
      return null;
    }
    exports.createScalarToken = cstScalar.createScalarToken;
    exports.resolveAsScalar = cstScalar.resolveAsScalar;
    exports.setScalarValue = cstScalar.setScalarValue;
    exports.stringify = cstStringify.stringify;
    exports.visit = cstVisit.visit;
    exports.BOM = BOM;
    exports.DOCUMENT = DOCUMENT;
    exports.FLOW_END = FLOW_END;
    exports.SCALAR = SCALAR;
    exports.isCollection = isCollection;
    exports.isScalar = isScalar;
    exports.prettyToken = prettyToken;
    exports.tokenType = tokenType;
  }
});

// node_modules/yaml/dist/parse/lexer.js
var require_lexer = __commonJS({
  "node_modules/yaml/dist/parse/lexer.js"(exports) {
    "use strict";
    var cst = require_cst();
    function isEmpty(ch) {
      switch (ch) {
        case void 0:
        case " ":
        case "\n":
        case "\r":
        case "	":
          return true;
        default:
          return false;
      }
    }
    var hexDigits = new Set("0123456789ABCDEFabcdef");
    var tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
    var flowIndicatorChars = new Set(",[]{}");
    var invalidAnchorChars = new Set(" ,[]{}\n\r	");
    var isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
    var Lexer = class {
      constructor() {
        this.atEnd = false;
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        this.buffer = "";
        this.flowKey = false;
        this.flowLevel = 0;
        this.indentNext = 0;
        this.indentValue = 0;
        this.lineEndPos = null;
        this.next = null;
        this.pos = 0;
      }
      /**
       * Generate YAML tokens from the `source` string. If `incomplete`,
       * a part of the last line may be left as a buffer for the next call.
       *
       * @returns A generator of lexical tokens
       */
      *lex(source, incomplete = false) {
        if (source) {
          if (typeof source !== "string")
            throw TypeError("source is not a string");
          this.buffer = this.buffer ? this.buffer + source : source;
          this.lineEndPos = null;
        }
        this.atEnd = !incomplete;
        let next = this.next ?? "stream";
        while (next && (incomplete || this.hasChars(1)))
          next = yield* this.parseNext(next);
      }
      atLineEnd() {
        let i = this.pos;
        let ch = this.buffer[i];
        while (ch === " " || ch === "	")
          ch = this.buffer[++i];
        if (!ch || ch === "#" || ch === "\n")
          return true;
        if (ch === "\r")
          return this.buffer[i + 1] === "\n";
        return false;
      }
      charAt(n) {
        return this.buffer[this.pos + n];
      }
      continueScalar(offset) {
        let ch = this.buffer[offset];
        if (this.indentNext > 0) {
          let indent = 0;
          while (ch === " ")
            ch = this.buffer[++indent + offset];
          if (ch === "\r") {
            const next = this.buffer[indent + offset + 1];
            if (next === "\n" || !next && !this.atEnd)
              return offset + indent + 1;
          }
          return ch === "\n" || indent >= this.indentNext || !ch && !this.atEnd ? offset + indent : -1;
        }
        if (ch === "-" || ch === ".") {
          const dt = this.buffer.substr(offset, 3);
          if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3]))
            return -1;
        }
        return offset;
      }
      getLine() {
        let end = this.lineEndPos;
        if (typeof end !== "number" || end !== -1 && end < this.pos) {
          end = this.buffer.indexOf("\n", this.pos);
          this.lineEndPos = end;
        }
        if (end === -1)
          return this.atEnd ? this.buffer.substring(this.pos) : null;
        if (this.buffer[end - 1] === "\r")
          end -= 1;
        return this.buffer.substring(this.pos, end);
      }
      hasChars(n) {
        return this.pos + n <= this.buffer.length;
      }
      setNext(state) {
        this.buffer = this.buffer.substring(this.pos);
        this.pos = 0;
        this.lineEndPos = null;
        this.next = state;
        return null;
      }
      peek(n) {
        return this.buffer.substr(this.pos, n);
      }
      *parseNext(next) {
        switch (next) {
          case "stream":
            return yield* this.parseStream();
          case "line-start":
            return yield* this.parseLineStart();
          case "block-start":
            return yield* this.parseBlockStart();
          case "doc":
            return yield* this.parseDocument();
          case "flow":
            return yield* this.parseFlowCollection();
          case "quoted-scalar":
            return yield* this.parseQuotedScalar();
          case "block-scalar":
            return yield* this.parseBlockScalar();
          case "plain-scalar":
            return yield* this.parsePlainScalar();
        }
      }
      *parseStream() {
        let line = this.getLine();
        if (line === null)
          return this.setNext("stream");
        if (line[0] === cst.BOM) {
          yield* this.pushCount(1);
          line = line.substring(1);
        }
        if (line[0] === "%") {
          let dirEnd = line.length;
          let cs = line.indexOf("#");
          while (cs !== -1) {
            const ch = line[cs - 1];
            if (ch === " " || ch === "	") {
              dirEnd = cs - 1;
              break;
            } else {
              cs = line.indexOf("#", cs + 1);
            }
          }
          while (true) {
            const ch = line[dirEnd - 1];
            if (ch === " " || ch === "	")
              dirEnd -= 1;
            else
              break;
          }
          const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
          yield* this.pushCount(line.length - n);
          this.pushNewline();
          return "stream";
        }
        if (this.atLineEnd()) {
          const sp = yield* this.pushSpaces(true);
          yield* this.pushCount(line.length - sp);
          yield* this.pushNewline();
          return "stream";
        }
        yield cst.DOCUMENT;
        return yield* this.parseLineStart();
      }
      *parseLineStart() {
        const ch = this.charAt(0);
        if (!ch && !this.atEnd)
          return this.setNext("line-start");
        if (ch === "-" || ch === ".") {
          if (!this.atEnd && !this.hasChars(4))
            return this.setNext("line-start");
          const s = this.peek(3);
          if ((s === "---" || s === "...") && isEmpty(this.charAt(3))) {
            yield* this.pushCount(3);
            this.indentValue = 0;
            this.indentNext = 0;
            return s === "---" ? "doc" : "stream";
          }
        }
        this.indentValue = yield* this.pushSpaces(false);
        if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
          this.indentNext = this.indentValue;
        return yield* this.parseBlockStart();
      }
      *parseBlockStart() {
        const [ch0, ch1] = this.peek(2);
        if (!ch1 && !this.atEnd)
          return this.setNext("block-start");
        if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
          const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
          this.indentNext = this.indentValue + 1;
          this.indentValue += n;
          return "block-start";
        }
        return "doc";
      }
      *parseDocument() {
        yield* this.pushSpaces(true);
        const line = this.getLine();
        if (line === null)
          return this.setNext("doc");
        let n = yield* this.pushIndicators();
        switch (line[n]) {
          case "#":
            yield* this.pushCount(line.length - n);
          // fallthrough
          case void 0:
            yield* this.pushNewline();
            return yield* this.parseLineStart();
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel = 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            return "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "doc";
          case '"':
          case "'":
            return yield* this.parseQuotedScalar();
          case "|":
          case ">":
            n += yield* this.parseBlockScalarHeader();
            n += yield* this.pushSpaces(true);
            yield* this.pushCount(line.length - n);
            yield* this.pushNewline();
            return yield* this.parseBlockScalar();
          default:
            return yield* this.parsePlainScalar();
        }
      }
      *parseFlowCollection() {
        let nl, sp;
        let indent = -1;
        do {
          nl = yield* this.pushNewline();
          if (nl > 0) {
            sp = yield* this.pushSpaces(false);
            this.indentValue = indent = sp;
          } else {
            sp = 0;
          }
          sp += yield* this.pushSpaces(true);
        } while (nl + sp > 0);
        const line = this.getLine();
        if (line === null)
          return this.setNext("flow");
        if (indent !== -1 && indent < this.indentNext && line[0] !== "#" || indent === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
          const atFlowEndMarker = indent === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}");
          if (!atFlowEndMarker) {
            this.flowLevel = 0;
            yield cst.FLOW_END;
            return yield* this.parseLineStart();
          }
        }
        let n = 0;
        while (line[n] === ",") {
          n += yield* this.pushCount(1);
          n += yield* this.pushSpaces(true);
          this.flowKey = false;
        }
        n += yield* this.pushIndicators();
        switch (line[n]) {
          case void 0:
            return "flow";
          case "#":
            yield* this.pushCount(line.length - n);
            return "flow";
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel += 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            this.flowKey = true;
            this.flowLevel -= 1;
            return this.flowLevel ? "flow" : "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "flow";
          case '"':
          case "'":
            this.flowKey = true;
            return yield* this.parseQuotedScalar();
          case ":": {
            const next = this.charAt(1);
            if (this.flowKey || isEmpty(next) || next === ",") {
              this.flowKey = false;
              yield* this.pushCount(1);
              yield* this.pushSpaces(true);
              return "flow";
            }
          }
          // fallthrough
          default:
            this.flowKey = false;
            return yield* this.parsePlainScalar();
        }
      }
      *parseQuotedScalar() {
        const quote = this.charAt(0);
        let end = this.buffer.indexOf(quote, this.pos + 1);
        if (quote === "'") {
          while (end !== -1 && this.buffer[end + 1] === "'")
            end = this.buffer.indexOf("'", end + 2);
        } else {
          while (end !== -1) {
            let n = 0;
            while (this.buffer[end - 1 - n] === "\\")
              n += 1;
            if (n % 2 === 0)
              break;
            end = this.buffer.indexOf('"', end + 1);
          }
        }
        const qb = this.buffer.substring(0, end);
        let nl = qb.indexOf("\n", this.pos);
        if (nl !== -1) {
          while (nl !== -1) {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = qb.indexOf("\n", cs);
          }
          if (nl !== -1) {
            end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
          }
        }
        if (end === -1) {
          if (!this.atEnd)
            return this.setNext("quoted-scalar");
          end = this.buffer.length;
        }
        yield* this.pushToIndex(end + 1, false);
        return this.flowLevel ? "flow" : "doc";
      }
      *parseBlockScalarHeader() {
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        let i = this.pos;
        while (true) {
          const ch = this.buffer[++i];
          if (ch === "+")
            this.blockScalarKeep = true;
          else if (ch > "0" && ch <= "9")
            this.blockScalarIndent = Number(ch) - 1;
          else if (ch !== "-")
            break;
        }
        return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
      }
      *parseBlockScalar() {
        let nl = this.pos - 1;
        let indent = 0;
        let ch;
        loop: for (let i2 = this.pos; ch = this.buffer[i2]; ++i2) {
          switch (ch) {
            case " ":
              indent += 1;
              break;
            case "\n":
              nl = i2;
              indent = 0;
              break;
            case "\r": {
              const next = this.buffer[i2 + 1];
              if (!next && !this.atEnd)
                return this.setNext("block-scalar");
              if (next === "\n")
                break;
            }
            // fallthrough
            default:
              break loop;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("block-scalar");
        if (indent >= this.indentNext) {
          if (this.blockScalarIndent === -1)
            this.indentNext = indent;
          else {
            this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
          }
          do {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = this.buffer.indexOf("\n", cs);
          } while (nl !== -1);
          if (nl === -1) {
            if (!this.atEnd)
              return this.setNext("block-scalar");
            nl = this.buffer.length;
          }
        }
        let i = nl + 1;
        ch = this.buffer[i];
        while (ch === " ")
          ch = this.buffer[++i];
        if (ch === "	") {
          while (ch === "	" || ch === " " || ch === "\r" || ch === "\n")
            ch = this.buffer[++i];
          nl = i - 1;
        } else if (!this.blockScalarKeep) {
          do {
            let i2 = nl - 1;
            let ch2 = this.buffer[i2];
            if (ch2 === "\r")
              ch2 = this.buffer[--i2];
            const lastChar = i2;
            while (ch2 === " ")
              ch2 = this.buffer[--i2];
            if (ch2 === "\n" && i2 >= this.pos && i2 + 1 + indent > lastChar)
              nl = i2;
            else
              break;
          } while (true);
        }
        yield cst.SCALAR;
        yield* this.pushToIndex(nl + 1, true);
        return yield* this.parseLineStart();
      }
      *parsePlainScalar() {
        const inFlow = this.flowLevel > 0;
        let end = this.pos - 1;
        let i = this.pos - 1;
        let ch;
        while (ch = this.buffer[++i]) {
          if (ch === ":") {
            const next = this.buffer[i + 1];
            if (isEmpty(next) || inFlow && flowIndicatorChars.has(next))
              break;
            end = i;
          } else if (isEmpty(ch)) {
            let next = this.buffer[i + 1];
            if (ch === "\r") {
              if (next === "\n") {
                i += 1;
                ch = "\n";
                next = this.buffer[i + 1];
              } else
                end = i;
            }
            if (next === "#" || inFlow && flowIndicatorChars.has(next))
              break;
            if (ch === "\n") {
              const cs = this.continueScalar(i + 1);
              if (cs === -1)
                break;
              i = Math.max(i, cs - 2);
            }
          } else {
            if (inFlow && flowIndicatorChars.has(ch))
              break;
            end = i;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("plain-scalar");
        yield cst.SCALAR;
        yield* this.pushToIndex(end + 1, true);
        return inFlow ? "flow" : "doc";
      }
      *pushCount(n) {
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos += n;
          return n;
        }
        return 0;
      }
      *pushToIndex(i, allowEmpty) {
        const s = this.buffer.slice(this.pos, i);
        if (s) {
          yield s;
          this.pos += s.length;
          return s.length;
        } else if (allowEmpty)
          yield "";
        return 0;
      }
      *pushIndicators() {
        let n = 0;
        loop: while (true) {
          switch (this.charAt(0)) {
            case "!":
              n += yield* this.pushTag();
              n += yield* this.pushSpaces(true);
              continue loop;
            case "&":
              n += yield* this.pushUntil(isNotAnchorChar);
              n += yield* this.pushSpaces(true);
              continue loop;
            case "-":
            // this is an error
            case "?":
            // this is an error outside flow collections
            case ":": {
              const inFlow = this.flowLevel > 0;
              const ch1 = this.charAt(1);
              if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
                if (!inFlow)
                  this.indentNext = this.indentValue + 1;
                else if (this.flowKey)
                  this.flowKey = false;
                n += yield* this.pushCount(1);
                n += yield* this.pushSpaces(true);
                continue loop;
              }
            }
          }
          break loop;
        }
        return n;
      }
      *pushTag() {
        if (this.charAt(1) === "<") {
          let i = this.pos + 2;
          let ch = this.buffer[i];
          while (!isEmpty(ch) && ch !== ">")
            ch = this.buffer[++i];
          return yield* this.pushToIndex(ch === ">" ? i + 1 : i, false);
        } else {
          let i = this.pos + 1;
          let ch = this.buffer[i];
          while (ch) {
            if (tagChars.has(ch))
              ch = this.buffer[++i];
            else if (ch === "%" && hexDigits.has(this.buffer[i + 1]) && hexDigits.has(this.buffer[i + 2])) {
              ch = this.buffer[i += 3];
            } else
              break;
          }
          return yield* this.pushToIndex(i, false);
        }
      }
      *pushNewline() {
        const ch = this.buffer[this.pos];
        if (ch === "\n")
          return yield* this.pushCount(1);
        else if (ch === "\r" && this.charAt(1) === "\n")
          return yield* this.pushCount(2);
        else
          return 0;
      }
      *pushSpaces(allowTabs) {
        let i = this.pos - 1;
        let ch;
        do {
          ch = this.buffer[++i];
        } while (ch === " " || allowTabs && ch === "	");
        const n = i - this.pos;
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos = i;
        }
        return n;
      }
      *pushUntil(test) {
        let i = this.pos;
        let ch = this.buffer[i];
        while (!test(ch))
          ch = this.buffer[++i];
        return yield* this.pushToIndex(i, false);
      }
    };
    exports.Lexer = Lexer;
  }
});

// node_modules/yaml/dist/parse/line-counter.js
var require_line_counter = __commonJS({
  "node_modules/yaml/dist/parse/line-counter.js"(exports) {
    "use strict";
    var LineCounter = class {
      constructor() {
        this.lineStarts = [];
        this.addNewLine = (offset) => this.lineStarts.push(offset);
        this.linePos = (offset) => {
          let low = 0;
          let high = this.lineStarts.length;
          while (low < high) {
            const mid = low + high >> 1;
            if (this.lineStarts[mid] < offset)
              low = mid + 1;
            else
              high = mid;
          }
          if (this.lineStarts[low] === offset)
            return { line: low + 1, col: 1 };
          if (low === 0)
            return { line: 0, col: offset };
          const start = this.lineStarts[low - 1];
          return { line: low, col: offset - start + 1 };
        };
      }
    };
    exports.LineCounter = LineCounter;
  }
});

// node_modules/yaml/dist/parse/parser.js
var require_parser = __commonJS({
  "node_modules/yaml/dist/parse/parser.js"(exports) {
    "use strict";
    var node_process = __require("process");
    var cst = require_cst();
    var lexer = require_lexer();
    function includesToken(list, type) {
      for (let i = 0; i < list.length; ++i)
        if (list[i].type === type)
          return true;
      return false;
    }
    function findNonEmptyIndex(list) {
      for (let i = 0; i < list.length; ++i) {
        switch (list[i].type) {
          case "space":
          case "comment":
          case "newline":
            break;
          default:
            return i;
        }
      }
      return -1;
    }
    function isFlowToken(token) {
      switch (token?.type) {
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "flow-collection":
          return true;
        default:
          return false;
      }
    }
    function getPrevProps(parent) {
      switch (parent.type) {
        case "document":
          return parent.start;
        case "block-map": {
          const it = parent.items[parent.items.length - 1];
          return it.sep ?? it.start;
        }
        case "block-seq":
          return parent.items[parent.items.length - 1].start;
        /* istanbul ignore next should not happen */
        default:
          return [];
      }
    }
    function getFirstKeyStartProps(prev) {
      if (prev.length === 0)
        return [];
      let i = prev.length;
      loop: while (--i >= 0) {
        switch (prev[i].type) {
          case "doc-start":
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
          case "newline":
            break loop;
        }
      }
      while (prev[++i]?.type === "space") {
      }
      return prev.splice(i, prev.length);
    }
    function arrayPushArray(target, source) {
      if (source.length < 1e5)
        Array.prototype.push.apply(target, source);
      else
        for (let i = 0; i < source.length; ++i)
          target.push(source[i]);
    }
    function fixFlowSeqItems(fc) {
      if (fc.start.type === "flow-seq-start") {
        for (const it of fc.items) {
          if (it.sep && !it.value && !includesToken(it.start, "explicit-key-ind") && !includesToken(it.sep, "map-value-ind")) {
            if (it.key)
              it.value = it.key;
            delete it.key;
            if (isFlowToken(it.value)) {
              if (it.value.end)
                arrayPushArray(it.value.end, it.sep);
              else
                it.value.end = it.sep;
            } else
              arrayPushArray(it.start, it.sep);
            delete it.sep;
          }
        }
      }
    }
    var Parser = class {
      /**
       * @param onNewLine - If defined, called separately with the start position of
       *   each new line (in `parse()`, including the start of input).
       */
      constructor(onNewLine) {
        this.atNewLine = true;
        this.atScalar = false;
        this.indent = 0;
        this.offset = 0;
        this.onKeyLine = false;
        this.stack = [];
        this.source = "";
        this.type = "";
        this.lexer = new lexer.Lexer();
        this.onNewLine = onNewLine;
      }
      /**
       * Parse `source` as a YAML stream.
       * If `incomplete`, a part of the last line may be left as a buffer for the next call.
       *
       * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
       *
       * @returns A generator of tokens representing each directive, document, and other structure.
       */
      *parse(source, incomplete = false) {
        if (this.onNewLine && this.offset === 0)
          this.onNewLine(0);
        for (const lexeme of this.lexer.lex(source, incomplete))
          yield* this.next(lexeme);
        if (!incomplete)
          yield* this.end();
      }
      /**
       * Advance the parser by the `source` of one lexical token.
       */
      *next(source) {
        this.source = source;
        if (node_process.env.LOG_TOKENS)
          console.log("|", cst.prettyToken(source));
        if (this.atScalar) {
          this.atScalar = false;
          yield* this.step();
          this.offset += source.length;
          return;
        }
        const type = cst.tokenType(source);
        if (!type) {
          const message = `Not a YAML token: ${source}`;
          yield* this.pop({ type: "error", offset: this.offset, message, source });
          this.offset += source.length;
        } else if (type === "scalar") {
          this.atNewLine = false;
          this.atScalar = true;
          this.type = "scalar";
        } else {
          this.type = type;
          yield* this.step();
          switch (type) {
            case "newline":
              this.atNewLine = true;
              this.indent = 0;
              if (this.onNewLine)
                this.onNewLine(this.offset + source.length);
              break;
            case "space":
              if (this.atNewLine && source[0] === " ")
                this.indent += source.length;
              break;
            case "explicit-key-ind":
            case "map-value-ind":
            case "seq-item-ind":
              if (this.atNewLine)
                this.indent += source.length;
              break;
            case "doc-mode":
            case "flow-error-end":
              return;
            default:
              this.atNewLine = false;
          }
          this.offset += source.length;
        }
      }
      /** Call at end of input to push out any remaining constructions */
      *end() {
        while (this.stack.length > 0)
          yield* this.pop();
      }
      get sourceToken() {
        const st = {
          type: this.type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
        return st;
      }
      *step() {
        const top = this.peek(1);
        if (this.type === "doc-end" && top?.type !== "doc-end") {
          while (this.stack.length > 0)
            yield* this.pop();
          this.stack.push({
            type: "doc-end",
            offset: this.offset,
            source: this.source
          });
          return;
        }
        if (!top)
          return yield* this.stream();
        switch (top.type) {
          case "document":
            return yield* this.document(top);
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return yield* this.scalar(top);
          case "block-scalar":
            return yield* this.blockScalar(top);
          case "block-map":
            return yield* this.blockMap(top);
          case "block-seq":
            return yield* this.blockSequence(top);
          case "flow-collection":
            return yield* this.flowCollection(top);
          case "doc-end":
            return yield* this.documentEnd(top);
        }
        yield* this.pop();
      }
      peek(n) {
        return this.stack[this.stack.length - n];
      }
      *pop(error) {
        const token = error ?? this.stack.pop();
        if (!token) {
          const message = "Tried to pop an empty stack";
          yield { type: "error", offset: this.offset, source: "", message };
        } else if (this.stack.length === 0) {
          yield token;
        } else {
          const top = this.peek(1);
          if (token.type === "block-scalar") {
            token.indent = "indent" in top ? top.indent : 0;
          } else if (token.type === "flow-collection" && top.type === "document") {
            token.indent = 0;
          }
          if (token.type === "flow-collection")
            fixFlowSeqItems(token);
          switch (top.type) {
            case "document":
              top.value = token;
              break;
            case "block-scalar":
              top.props.push(token);
              break;
            case "block-map": {
              const it = top.items[top.items.length - 1];
              if (it.value) {
                top.items.push({ start: [], key: token, sep: [] });
                this.onKeyLine = true;
                return;
              } else if (it.sep) {
                it.value = token;
              } else {
                Object.assign(it, { key: token, sep: [] });
                this.onKeyLine = !it.explicitKey;
                return;
              }
              break;
            }
            case "block-seq": {
              const it = top.items[top.items.length - 1];
              if (it.value)
                top.items.push({ start: [], value: token });
              else
                it.value = token;
              break;
            }
            case "flow-collection": {
              const it = top.items[top.items.length - 1];
              if (!it || it.value)
                top.items.push({ start: [], key: token, sep: [] });
              else if (it.sep)
                it.value = token;
              else
                Object.assign(it, { key: token, sep: [] });
              return;
            }
            /* istanbul ignore next should not happen */
            default:
              yield* this.pop();
              yield* this.pop(token);
          }
          if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
            const last = token.items[token.items.length - 1];
            if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))) {
              if (top.type === "document")
                top.end = last.start;
              else
                top.items.push({ start: last.start });
              token.items.splice(-1, 1);
            }
          }
        }
      }
      *stream() {
        switch (this.type) {
          case "directive-line":
            yield { type: "directive", offset: this.offset, source: this.source };
            return;
          case "byte-order-mark":
          case "space":
          case "comment":
          case "newline":
            yield this.sourceToken;
            return;
          case "doc-mode":
          case "doc-start": {
            const doc = {
              type: "document",
              offset: this.offset,
              start: []
            };
            if (this.type === "doc-start")
              doc.start.push(this.sourceToken);
            this.stack.push(doc);
            return;
          }
        }
        yield {
          type: "error",
          offset: this.offset,
          message: `Unexpected ${this.type} token in YAML stream`,
          source: this.source
        };
      }
      *document(doc) {
        if (doc.value)
          return yield* this.lineEnd(doc);
        switch (this.type) {
          case "doc-start": {
            if (findNonEmptyIndex(doc.start) !== -1) {
              yield* this.pop();
              yield* this.step();
            } else
              doc.start.push(this.sourceToken);
            return;
          }
          case "anchor":
          case "tag":
          case "space":
          case "comment":
          case "newline":
            doc.start.push(this.sourceToken);
            return;
        }
        const bv = this.startBlockValue(doc);
        if (bv)
          this.stack.push(bv);
        else {
          yield {
            type: "error",
            offset: this.offset,
            message: `Unexpected ${this.type} token in YAML document`,
            source: this.source
          };
        }
      }
      *scalar(scalar) {
        if (this.type === "map-value-ind") {
          const prev = getPrevProps(this.peek(2));
          const start = getFirstKeyStartProps(prev);
          let sep;
          if (scalar.end) {
            sep = scalar.end;
            sep.push(this.sourceToken);
            delete scalar.end;
          } else
            sep = [this.sourceToken];
          const map = {
            type: "block-map",
            offset: scalar.offset,
            indent: scalar.indent,
            items: [{ start, key: scalar, sep }]
          };
          this.onKeyLine = true;
          this.stack[this.stack.length - 1] = map;
        } else
          yield* this.lineEnd(scalar);
      }
      *blockScalar(scalar) {
        switch (this.type) {
          case "space":
          case "comment":
          case "newline":
            scalar.props.push(this.sourceToken);
            return;
          case "scalar":
            scalar.source = this.source;
            this.atNewLine = true;
            this.indent = 0;
            if (this.onNewLine) {
              let nl = this.source.indexOf("\n") + 1;
              while (nl !== 0) {
                this.onNewLine(this.offset + nl);
                nl = this.source.indexOf("\n", nl) + 1;
              }
            }
            yield* this.pop();
            break;
          /* istanbul ignore next should not happen */
          default:
            yield* this.pop();
            yield* this.step();
        }
      }
      *blockMap(map) {
        const it = map.items[map.items.length - 1];
        switch (this.type) {
          case "newline":
            this.onKeyLine = false;
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                map.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              it.start.push(this.sourceToken);
            }
            return;
          case "space":
          case "comment":
            if (it.value) {
              map.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              if (this.atIndentedComment(it.start, map.indent)) {
                const prev = map.items[map.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  arrayPushArray(end, it.start);
                  end.push(this.sourceToken);
                  map.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
        }
        if (this.indent >= map.indent) {
          const atMapIndent = !this.onKeyLine && this.indent === map.indent;
          const atNextItem = atMapIndent && (it.sep || it.explicitKey) && this.type !== "seq-item-ind";
          let start = [];
          if (atNextItem && it.sep && !it.value) {
            const nl = [];
            for (let i = 0; i < it.sep.length; ++i) {
              const st = it.sep[i];
              switch (st.type) {
                case "newline":
                  nl.push(i);
                  break;
                case "space":
                  break;
                case "comment":
                  if (st.indent > map.indent)
                    nl.length = 0;
                  break;
                default:
                  nl.length = 0;
              }
            }
            if (nl.length >= 2)
              start = it.sep.splice(nl[1]);
          }
          switch (this.type) {
            case "anchor":
            case "tag":
              if (atNextItem || it.value) {
                start.push(this.sourceToken);
                map.items.push({ start });
                this.onKeyLine = true;
              } else if (it.sep) {
                it.sep.push(this.sourceToken);
              } else {
                it.start.push(this.sourceToken);
              }
              return;
            case "explicit-key-ind":
              if (!it.sep && !it.explicitKey) {
                it.start.push(this.sourceToken);
                it.explicitKey = true;
              } else if (atNextItem || it.value) {
                start.push(this.sourceToken);
                map.items.push({ start, explicitKey: true });
              } else {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: [this.sourceToken], explicitKey: true }]
                });
              }
              this.onKeyLine = true;
              return;
            case "map-value-ind":
              if (it.explicitKey) {
                if (!it.sep) {
                  if (includesToken(it.start, "newline")) {
                    Object.assign(it, { key: null, sep: [this.sourceToken] });
                  } else {
                    const start2 = getFirstKeyStartProps(it.start);
                    this.stack.push({
                      type: "block-map",
                      offset: this.offset,
                      indent: this.indent,
                      items: [{ start: start2, key: null, sep: [this.sourceToken] }]
                    });
                  }
                } else if (it.value) {
                  map.items.push({ start: [], key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start, key: null, sep: [this.sourceToken] }]
                  });
                } else if (isFlowToken(it.key) && !includesToken(it.sep, "newline")) {
                  const start2 = getFirstKeyStartProps(it.start);
                  const key = it.key;
                  const sep = it.sep;
                  sep.push(this.sourceToken);
                  delete it.key;
                  delete it.sep;
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: start2, key, sep }]
                  });
                } else if (start.length > 0) {
                  it.sep = it.sep.concat(start, this.sourceToken);
                } else {
                  it.sep.push(this.sourceToken);
                }
              } else {
                if (!it.sep) {
                  Object.assign(it, { key: null, sep: [this.sourceToken] });
                } else if (it.value || atNextItem) {
                  map.items.push({ start, key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: [], key: null, sep: [this.sourceToken] }]
                  });
                } else {
                  it.sep.push(this.sourceToken);
                }
              }
              this.onKeyLine = true;
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs = this.flowScalar(this.type);
              if (atNextItem || it.value) {
                map.items.push({ start, key: fs, sep: [] });
                this.onKeyLine = true;
              } else if (it.sep) {
                this.stack.push(fs);
              } else {
                Object.assign(it, { key: fs, sep: [] });
                this.onKeyLine = true;
              }
              return;
            }
            default: {
              const bv = this.startBlockValue(map);
              if (bv) {
                if (bv.type === "block-seq") {
                  if (!it.explicitKey && it.sep && !includesToken(it.sep, "newline")) {
                    yield* this.pop({
                      type: "error",
                      offset: this.offset,
                      message: "Unexpected block-seq-ind on same line with key",
                      source: this.source
                    });
                    return;
                  }
                } else if (atMapIndent) {
                  map.items.push({ start });
                }
                this.stack.push(bv);
                return;
              }
            }
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *blockSequence(seq) {
        const it = seq.items[seq.items.length - 1];
        switch (this.type) {
          case "newline":
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                seq.items.push({ start: [this.sourceToken] });
            } else
              it.start.push(this.sourceToken);
            return;
          case "space":
          case "comment":
            if (it.value)
              seq.items.push({ start: [this.sourceToken] });
            else {
              if (this.atIndentedComment(it.start, seq.indent)) {
                const prev = seq.items[seq.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  arrayPushArray(end, it.start);
                  end.push(this.sourceToken);
                  seq.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
          case "anchor":
          case "tag":
            if (it.value || this.indent <= seq.indent)
              break;
            it.start.push(this.sourceToken);
            return;
          case "seq-item-ind":
            if (this.indent !== seq.indent)
              break;
            if (it.value || includesToken(it.start, "seq-item-ind"))
              seq.items.push({ start: [this.sourceToken] });
            else
              it.start.push(this.sourceToken);
            return;
        }
        if (this.indent > seq.indent) {
          const bv = this.startBlockValue(seq);
          if (bv) {
            this.stack.push(bv);
            return;
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *flowCollection(fc) {
        const it = fc.items[fc.items.length - 1];
        if (this.type === "flow-error-end") {
          let top;
          do {
            yield* this.pop();
            top = this.peek(1);
          } while (top?.type === "flow-collection");
        } else if (fc.end.length === 0) {
          switch (this.type) {
            case "comma":
            case "explicit-key-ind":
              if (!it || it.sep)
                fc.items.push({ start: [this.sourceToken] });
              else
                it.start.push(this.sourceToken);
              return;
            case "map-value-ind":
              if (!it || it.value)
                fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                Object.assign(it, { key: null, sep: [this.sourceToken] });
              return;
            case "space":
            case "comment":
            case "newline":
            case "anchor":
            case "tag":
              if (!it || it.value)
                fc.items.push({ start: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                it.start.push(this.sourceToken);
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs = this.flowScalar(this.type);
              if (!it || it.value)
                fc.items.push({ start: [], key: fs, sep: [] });
              else if (it.sep)
                this.stack.push(fs);
              else
                Object.assign(it, { key: fs, sep: [] });
              return;
            }
            case "flow-map-end":
            case "flow-seq-end":
              fc.end.push(this.sourceToken);
              return;
          }
          const bv = this.startBlockValue(fc);
          if (bv)
            this.stack.push(bv);
          else {
            yield* this.pop();
            yield* this.step();
          }
        } else {
          const parent = this.peek(2);
          if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
            yield* this.pop();
            yield* this.step();
          } else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            fixFlowSeqItems(fc);
            const sep = fc.end.splice(1, fc.end.length);
            sep.push(this.sourceToken);
            const map = {
              type: "block-map",
              offset: fc.offset,
              indent: fc.indent,
              items: [{ start, key: fc, sep }]
            };
            this.onKeyLine = true;
            this.stack[this.stack.length - 1] = map;
          } else {
            yield* this.lineEnd(fc);
          }
        }
      }
      flowScalar(type) {
        if (this.onNewLine) {
          let nl = this.source.indexOf("\n") + 1;
          while (nl !== 0) {
            this.onNewLine(this.offset + nl);
            nl = this.source.indexOf("\n", nl) + 1;
          }
        }
        return {
          type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
      }
      startBlockValue(parent) {
        switch (this.type) {
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return this.flowScalar(this.type);
          case "block-scalar-header":
            return {
              type: "block-scalar",
              offset: this.offset,
              indent: this.indent,
              props: [this.sourceToken],
              source: ""
            };
          case "flow-map-start":
          case "flow-seq-start":
            return {
              type: "flow-collection",
              offset: this.offset,
              indent: this.indent,
              start: this.sourceToken,
              items: [],
              end: []
            };
          case "seq-item-ind":
            return {
              type: "block-seq",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [this.sourceToken] }]
            };
          case "explicit-key-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            start.push(this.sourceToken);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start, explicitKey: true }]
            };
          }
          case "map-value-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start, key: null, sep: [this.sourceToken] }]
            };
          }
        }
        return null;
      }
      atIndentedComment(start, indent) {
        if (this.type !== "comment")
          return false;
        if (this.indent <= indent)
          return false;
        return start.every((st) => st.type === "newline" || st.type === "space");
      }
      *documentEnd(docEnd) {
        if (this.type !== "doc-mode") {
          if (docEnd.end)
            docEnd.end.push(this.sourceToken);
          else
            docEnd.end = [this.sourceToken];
          if (this.type === "newline")
            yield* this.pop();
        }
      }
      *lineEnd(token) {
        switch (this.type) {
          case "comma":
          case "doc-start":
          case "doc-end":
          case "flow-seq-end":
          case "flow-map-end":
          case "map-value-ind":
            yield* this.pop();
            yield* this.step();
            break;
          case "newline":
            this.onKeyLine = false;
          // fallthrough
          case "space":
          case "comment":
          default:
            if (token.end)
              token.end.push(this.sourceToken);
            else
              token.end = [this.sourceToken];
            if (this.type === "newline")
              yield* this.pop();
        }
      }
    };
    exports.Parser = Parser;
  }
});

// node_modules/yaml/dist/public-api.js
var require_public_api = __commonJS({
  "node_modules/yaml/dist/public-api.js"(exports) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var errors = require_errors();
    var log = require_log();
    var identity = require_identity();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    function parseOptions(options) {
      const prettyErrors = options.prettyErrors !== false;
      const lineCounter$1 = options.lineCounter || prettyErrors && new lineCounter.LineCounter() || null;
      return { lineCounter: lineCounter$1, prettyErrors };
    }
    function parseAllDocuments(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      const docs = Array.from(composer$1.compose(parser$1.parse(source)));
      if (prettyErrors && lineCounter2)
        for (const doc of docs) {
          doc.errors.forEach(errors.prettifyError(source, lineCounter2));
          doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
        }
      if (docs.length > 0)
        return docs;
      return Object.assign([], { empty: true }, composer$1.streamInfo());
    }
    function parseDocument(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      let doc = null;
      for (const _doc of composer$1.compose(parser$1.parse(source), true, source.length)) {
        if (!doc)
          doc = _doc;
        else if (doc.options.logLevel !== "silent") {
          doc.errors.push(new errors.YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
          break;
        }
      }
      if (prettyErrors && lineCounter2) {
        doc.errors.forEach(errors.prettifyError(source, lineCounter2));
        doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
      }
      return doc;
    }
    function parse(src, reviver, options) {
      let _reviver = void 0;
      if (typeof reviver === "function") {
        _reviver = reviver;
      } else if (options === void 0 && reviver && typeof reviver === "object") {
        options = reviver;
      }
      const doc = parseDocument(src, options);
      if (!doc)
        return null;
      doc.warnings.forEach((warning) => log.warn(doc.options.logLevel, warning));
      if (doc.errors.length > 0) {
        if (doc.options.logLevel !== "silent")
          throw doc.errors[0];
        else
          doc.errors = [];
      }
      return doc.toJS(Object.assign({ reviver: _reviver }, options));
    }
    function stringify(value, replacer, options) {
      let _replacer = null;
      if (typeof replacer === "function" || Array.isArray(replacer)) {
        _replacer = replacer;
      } else if (options === void 0 && replacer) {
        options = replacer;
      }
      if (typeof options === "string")
        options = options.length;
      if (typeof options === "number") {
        const indent = Math.round(options);
        options = indent < 1 ? void 0 : indent > 8 ? { indent: 8 } : { indent };
      }
      if (value === void 0) {
        const { keepUndefined } = options ?? replacer ?? {};
        if (!keepUndefined)
          return void 0;
      }
      if (identity.isDocument(value) && !_replacer)
        return value.toString(options);
      return new Document.Document(value, _replacer, options).toString(options);
    }
    exports.parse = parse;
    exports.parseAllDocuments = parseAllDocuments;
    exports.parseDocument = parseDocument;
    exports.stringify = stringify;
  }
});

// node_modules/yaml/dist/index.js
var require_dist = __commonJS({
  "node_modules/yaml/dist/index.js"(exports) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var Schema = require_Schema();
    var errors = require_errors();
    var Alias = require_Alias();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var cst = require_cst();
    var lexer = require_lexer();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    var publicApi = require_public_api();
    var visit = require_visit();
    exports.Composer = composer.Composer;
    exports.Document = Document.Document;
    exports.Schema = Schema.Schema;
    exports.YAMLError = errors.YAMLError;
    exports.YAMLParseError = errors.YAMLParseError;
    exports.YAMLWarning = errors.YAMLWarning;
    exports.Alias = Alias.Alias;
    exports.isAlias = identity.isAlias;
    exports.isCollection = identity.isCollection;
    exports.isDocument = identity.isDocument;
    exports.isMap = identity.isMap;
    exports.isNode = identity.isNode;
    exports.isPair = identity.isPair;
    exports.isScalar = identity.isScalar;
    exports.isSeq = identity.isSeq;
    exports.Pair = Pair.Pair;
    exports.Scalar = Scalar.Scalar;
    exports.YAMLMap = YAMLMap.YAMLMap;
    exports.YAMLSeq = YAMLSeq.YAMLSeq;
    exports.CST = cst;
    exports.Lexer = lexer.Lexer;
    exports.LineCounter = lineCounter.LineCounter;
    exports.Parser = parser.Parser;
    exports.parse = publicApi.parse;
    exports.parseAllDocuments = publicApi.parseAllDocuments;
    exports.parseDocument = publicApi.parseDocument;
    exports.stringify = publicApi.stringify;
    exports.visit = visit.visit;
    exports.visitAsync = visit.visitAsync;
  }
});

// skills/investment-mirror/scripts/investment_mirror_cli.ts
import { existsSync as existsSync2 } from "node:fs";

// skills/investment-mirror/src/core.ts
var import_yaml = __toESM(require_dist(), 1);
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, appendFileSync, unlinkSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

// skills/investment-mirror/src/master_data.ts
var shared = {
  dataroma: {
    title: "Dataroma superinvestor manager index",
    url: "https://www.dataroma.com/m/managers.php",
    quality: "portfolio_tracker",
    notes: "Useful as public 13F context where applicable; not a complete record of private holdings or short books."
  },
  grahamDoddsville: {
    title: "Columbia Heilbrunn Center Graham & Doddsville",
    url: "https://business.columbia.edu/heilbrunn/resources/graham-and-doddsville-newsletter",
    quality: "research",
    notes: "Practitioner interviews and value-investing education source; useful for style and process context."
  },
  berkshireLetters: {
    title: "Berkshire Hathaway shareholder letters",
    url: "https://www.berkshirehathaway.com/letters/letters.html",
    quality: "primary",
    notes: "Primary record for Buffett and Munger owner-oriented language, capital allocation, and business-quality framing."
  },
  oaktreeMemos: {
    title: "Oaktree memos",
    url: "https://www.oaktreecapital.com/insights/memo",
    quality: "memo",
    notes: "Primary practitioner source for risk, cycles, and second-level thinking."
  },
  aqrResearch: {
    title: "AQR research library",
    url: "https://www.aqr.com/Insights/Research",
    quality: "research",
    notes: "Research source for factor investing, value, momentum, and systematic process."
  }
};
var MASTER_RECORDS = [
  {
    id: "benjamin_graham",
    displayName: "Benjamin Graham",
    region: "United States",
    tier: "canonical",
    category: "Value / margin of safety",
    styleTags: ["value", "margin_of_safety", "mr_market", "security_analysis"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Benjamin_Graham",
    readMoreUrl: "https://business.columbia.edu/heilbrunn/resources/graham-and-doddsville-newsletter",
    sources: [
      { title: "Benjamin Graham biography", url: "https://en.wikipedia.org/wiki/Benjamin_Graham", quality: "biography", notes: "Baseline biography and publication context." },
      { title: "The Intelligent Investor", url: "https://en.wikipedia.org/wiki/The_Intelligent_Investor", quality: "book", notes: "Book context for margin of safety and investor temperament." },
      { title: "Security Analysis", url: "https://en.wikipedia.org/wiki/Security_Analysis_(book)", quality: "book", notes: "Book context for fundamental security analysis." },
      shared.grahamDoddsville
    ],
    teaches: ["margin of safety", "Mr. Market discipline", "separate price from value", "process before excitement"],
    commonMisreadings: ["deep value is not automatic cheapness", "margin of safety is not a slogan", "net-net discipline does not remove business risk"],
    bioSummary: "Benjamin Graham was a Columbia professor, author, and investor associated with security analysis, value investing, and the margin-of-safety concept.",
    investmentStyle: "Fundamental value investing that starts with business value, balance-sheet evidence, and a gap between price and conservative appraisal.",
    notableResultsSummary: "His notable contribution is the intellectual foundation of value investing through Security Analysis and The Intelligent Investor, plus his influence on later investors.",
    whatToLearn: ["define value before action", "demand a margin of safety", "treat market price as an offer, not instruction"],
    whatNotToCopy: ["do not treat statistical cheapness as sufficient evidence when business quality is deteriorating"],
    guardrailRelevance: ["valuation_expectation_missing", "evidence_basis_missing", "authority_anchor", "downside_protocol_missing"],
    vector: { narrative_sensitivity: 22, valuation_discipline: 96, evidence_threshold: 88, falsifiability_discipline: 84, time_horizon_clarity: 78, research_loop_tendency: 58, contrarian_impulse: 70, product_founder_bias: 18, downside_first_thinking: 94, catalyst_dependence: 42, cycle_regime_sensitivity: 44, systematic_vs_discretionary: 70, concentration_comfort: 30, authority_reliance: 18, value_capture_clarity: 76 }
  },
  {
    id: "warren_buffett",
    displayName: "Warren Buffett",
    region: "United States",
    tier: "canonical",
    category: "Value / margin of safety",
    styleTags: ["quality_value", "capital_allocation", "long_term_ownership", "business_quality"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Warren_Buffett",
    readMoreUrl: "https://www.berkshirehathaway.com/letters/letters.html",
    sources: [
      shared.berkshireLetters,
      { title: "Warren Buffett biography", url: "https://en.wikipedia.org/wiki/Warren_Buffett", quality: "biography", notes: "Biography and Berkshire context." },
      { title: "Berkshire Hathaway annual reports", url: "https://www.berkshirehathaway.com/reports.html", quality: "primary", notes: "Primary company record for Berkshire results and holdings context." },
      shared.dataroma
    ],
    teaches: ["owner mindset", "business quality", "capital allocation", "circle of competence", "patience"],
    commonMisreadings: ["quality does not mean any price", "long term does not mean never revisiting thesis", "copying holdings is not copying process"],
    bioSummary: "Warren Buffett is the chair and CEO of Berkshire Hathaway and is known for owner-oriented investing, business-quality analysis, and plain-language shareholder letters.",
    investmentStyle: "Quality-aware value investing focused on durable economics, capable management, capital allocation, and long holding periods.",
    notableResultsSummary: "Berkshire Hathaway's long public record and shareholder letters provide source-backed context for Buffett's investment approach without needing unsupported rankings.",
    whatToLearn: ["write the owner thesis", "stay inside circle of competence", "connect business quality to price"],
    whatNotToCopy: ["do not copy Berkshire holdings without the capital structure, information, tax, and time-horizon context"],
    guardrailRelevance: ["valuation_expectation_missing", "quality_without_price", "authority_anchor", "time_horizon_missing"],
    vector: { narrative_sensitivity: 54, valuation_discipline: 88, evidence_threshold: 82, falsifiability_discipline: 76, time_horizon_clarity: 92, research_loop_tendency: 54, contrarian_impulse: 62, product_founder_bias: 48, downside_first_thinking: 82, catalyst_dependence: 24, cycle_regime_sensitivity: 50, systematic_vs_discretionary: 45, concentration_comfort: 72, authority_reliance: 20, value_capture_clarity: 86 }
  },
  {
    id: "charlie_munger",
    displayName: "Charlie Munger",
    region: "United States",
    tier: "canonical",
    category: "Value / margin of safety",
    styleTags: ["mental_models", "quality", "incentives", "inversion"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Charlie_Munger",
    readMoreUrl: "https://www.berkshirehathaway.com/letters/letters.html",
    sources: [
      shared.berkshireLetters,
      { title: "Charlie Munger biography", url: "https://en.wikipedia.org/wiki/Charlie_Munger", quality: "biography", notes: "Biography, Berkshire role, and publication context." },
      { title: "Poor Charlie's Almanack", url: "https://en.wikipedia.org/wiki/Poor_Charlie%27s_Almanack", quality: "book", notes: "Book context for mental models and inversion." },
      shared.grahamDoddsville
    ],
    teaches: ["inversion", "incentives", "avoid stupidity", "multidisciplinary mental models", "quality threshold"],
    commonMisreadings: ["mental models are not decorative quotes", "concentration requires exceptional standards", "inversion is a test, not a vibe"],
    bioSummary: "Charlie Munger was Berkshire Hathaway's vice chairman and a long-time advocate of multidisciplinary thinking, incentives analysis, and inversion.",
    investmentStyle: "Quality-oriented value investing with a high bar for business quality, incentives, management behavior, and avoidable error.",
    notableResultsSummary: "His public record is most useful as process evidence: Berkshire letters, speeches, and Poor Charlie's Almanack document his mental-model approach.",
    whatToLearn: ["invert the thesis", "inspect incentives", "use simple mental models to avoid avoidable loss"],
    whatNotToCopy: ["do not use aphorisms as substitutes for security-specific evidence"],
    guardrailRelevance: ["falsification_missing", "management_shortcut", "authority_anchor", "downside_protocol_missing"],
    vector: { narrative_sensitivity: 50, valuation_discipline: 80, evidence_threshold: 84, falsifiability_discipline: 90, time_horizon_clarity: 88, research_loop_tendency: 46, contrarian_impulse: 58, product_founder_bias: 42, downside_first_thinking: 88, catalyst_dependence: 20, cycle_regime_sensitivity: 48, systematic_vs_discretionary: 42, concentration_comfort: 80, authority_reliance: 16, value_capture_clarity: 84 }
  },
  {
    id: "walter_schloss",
    displayName: "Walter Schloss",
    region: "United States",
    tier: "extended",
    category: "Value / margin of safety",
    styleTags: ["deep_value", "diversification", "balance_sheet", "simple_process"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Walter_Schloss",
    readMoreUrl: "https://www8.gsb.columbia.edu/sites/valueinvesting/files/files/Buffett1984.pdf",
    sources: [
      { title: "Walter Schloss biography", url: "https://en.wikipedia.org/wiki/Walter_Schloss", quality: "biography", notes: "Biography and style overview." },
      shared.grahamDoddsville,
      shared.dataroma,
      { title: "The Superinvestors of Graham-and-Doddsville", url: "https://www8.gsb.columbia.edu/sites/valueinvesting/files/files/Buffett1984.pdf", quality: "primary", notes: "Buffett essay naming Schloss as a Graham-and-Doddsville example; use as style context, not standalone performance ranking." }
    ],
    teaches: ["simple valuation discipline", "diversified cheapness", "balance-sheet checks", "avoid complexity"],
    commonMisreadings: ["simple is not shallow", "diversification is not lack of conviction", "cheapness still needs solvency checks"],
    bioSummary: "Walter Schloss was a Graham-influenced value investor known for a simple, price-focused, diversified approach to undervalued securities.",
    investmentStyle: "Deep value investing with emphasis on price, asset value, balance-sheet evidence, and diversification rather than elaborate forecasts.",
    notableResultsSummary: "Public discussions emphasize his long practice of Graham-style value investing and his reputation for simple discipline.",
    whatToLearn: ["keep the checklist simple", "check balance-sheet support", "avoid narrative over-elaboration"],
    whatNotToCopy: ["do not buy weak businesses solely because they screen cheap"],
    guardrailRelevance: ["valuation_expectation_missing", "single_metric_overweight", "evidence_basis_missing"],
    vector: { narrative_sensitivity: 18, valuation_discipline: 94, evidence_threshold: 76, falsifiability_discipline: 78, time_horizon_clarity: 72, research_loop_tendency: 42, contrarian_impulse: 74, product_founder_bias: 12, downside_first_thinking: 88, catalyst_dependence: 34, cycle_regime_sensitivity: 36, systematic_vs_discretionary: 66, concentration_comfort: 22, authority_reliance: 16, value_capture_clarity: 68 }
  },
  {
    id: "seth_klarman",
    displayName: "Seth Klarman",
    region: "United States",
    tier: "canonical",
    category: "Value / margin of safety",
    styleTags: ["value", "risk", "margin_of_safety", "downside_first"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Seth_Klarman",
    readMoreUrl: "https://business.columbia.edu/heilbrunn/resources/graham-and-doddsville-newsletter",
    sources: [
      { title: "Seth Klarman biography", url: "https://en.wikipedia.org/wiki/Seth_Klarman", quality: "biography", notes: "Biography and Baupost context." },
      { title: "Margin of Safety", url: "https://en.wikipedia.org/wiki/Margin_of_Safety_(book)", quality: "book", notes: "Book context for risk and value discipline." },
      shared.grahamDoddsville,
      shared.dataroma
    ],
    teaches: ["risk before return", "margin of safety", "liquidity awareness", "patience under uncertainty"],
    commonMisreadings: ["cash and caution are process choices, not fear", "margin of safety is not only low multiples", "distressed value requires legal and capital-structure work"],
    bioSummary: "Seth Klarman is the CEO of Baupost Group and author of Margin of Safety, publicly associated with risk-aware value investing.",
    investmentStyle: "Downside-first value investing that emphasizes margin of safety, patience, liquidity, and skepticism toward crowd behavior.",
    notableResultsSummary: "Public source value is strongest for his risk framing and margin-of-safety philosophy rather than for precise performance claims.",
    whatToLearn: ["define downside first", "separate permanent loss from volatility", "wait when evidence is incomplete"],
    whatNotToCopy: ["do not use caution as an excuse to avoid stating decision criteria"],
    guardrailRelevance: ["downside_protocol_missing", "valuation_expectation_missing", "source_quality_weak", "scenario_absent"],
    vector: { narrative_sensitivity: 26, valuation_discipline: 94, evidence_threshold: 88, falsifiability_discipline: 84, time_horizon_clarity: 80, research_loop_tendency: 62, contrarian_impulse: 76, product_founder_bias: 18, downside_first_thinking: 96, catalyst_dependence: 46, cycle_regime_sensitivity: 54, systematic_vs_discretionary: 54, concentration_comfort: 58, authority_reliance: 14, value_capture_clarity: 78 }
  },
  {
    id: "li_lu",
    displayName: "Li Lu / \u674E\u5F55",
    region: "United States / China",
    tier: "canonical",
    category: "Value / margin of safety",
    styleTags: ["value_investing", "long_term_compounders", "accurate_information", "owner_mindset"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Li_Lu",
    readMoreUrl: "https://www.himcap.com/",
    sources: [
      { title: "Li Lu biography", url: "https://en.wikipedia.org/wiki/Li_Lu", quality: "biography", notes: "Biography and Himalaya Capital context." },
      { title: "Himalaya Capital", url: "https://www.himcap.com/", quality: "official", notes: "Official firm source; use for principles and firm positioning." },
      shared.grahamDoddsville,
      shared.dataroma
    ],
    teaches: ["accurate and complete information", "owner mindset", "long-term compounding", "intellectual honesty"],
    commonMisreadings: ["China focus is not a shortcut to edge", "long-term holding requires high information quality", "borrowed conviction is not owner mindset"],
    bioSummary: "Li Lu is the founder and chairman of Himalaya Capital and is associated publicly with long-term value investing and owner-oriented research.",
    investmentStyle: "Long-term value investing that combines business quality, accurate information, patience, and an owner mindset.",
    notableResultsSummary: "Publicly available sources are most useful for his stated principles, Himalaya context, and reputation in value-investing circles.",
    whatToLearn: ["raise information quality", "own the thesis independently", "treat understanding as a discipline"],
    whatNotToCopy: ["do not convert admiration for a company or investor into borrowed conviction"],
    guardrailRelevance: ["source_quality_weak", "authority_anchor", "valuation_expectation_missing", "evidence_basis_missing"],
    vector: { narrative_sensitivity: 48, valuation_discipline: 84, evidence_threshold: 94, falsifiability_discipline: 82, time_horizon_clarity: 90, research_loop_tendency: 68, contrarian_impulse: 60, product_founder_bias: 44, downside_first_thinking: 82, catalyst_dependence: 24, cycle_regime_sensitivity: 56, systematic_vs_discretionary: 40, concentration_comfort: 76, authority_reliance: 12, value_capture_clarity: 88 }
  },
  {
    id: "duan_yongping",
    displayName: "Duan Yongping / \u6BB5\u6C38\u5E73",
    region: "China / United States",
    tier: "modern_case",
    category: "Quality growth / compounders",
    styleTags: ["entrepreneur_investor", "business_quality", "common_sense", "long_term_ownership"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Duan_Yongping",
    readMoreUrl: "https://en.wikipedia.org/wiki/Duan_Yongping",
    sources: [
      { title: "Duan Yongping biography", url: "https://en.wikipedia.org/wiki/Duan_Yongping", quality: "biography", notes: "Baseline biography and entrepreneur-investor context." },
      { title: "BBK Electronics", url: "https://en.wikipedia.org/wiki/BBK_Electronics", quality: "reliable_secondary", notes: "Business context for Duan's operating background." },
      { title: "NetEase", url: "https://en.wikipedia.org/wiki/NetEase", quality: "reliable_secondary", notes: "Relevant public company context often associated with Duan's public investing history." },
      shared.dataroma
    ],
    teaches: ["business common sense", "owner/operator lens", "good business vs good product", "patience"],
    commonMisreadings: ["a good product is not automatically a good stock", "operator intuition still needs price and governance checks", "public forum summaries need source caution"],
    bioSummary: "Duan Yongping is an entrepreneur and investor associated with BBK-related businesses and a public reputation for common-sense business-quality investing.",
    investmentStyle: "Owner-oriented quality investing informed by operating experience, business durability, and common-sense economics.",
    notableResultsSummary: "Use his public biography and operating history as style context; avoid unsupported claims from reposted forum material.",
    whatToLearn: ["test business common sense", "separate product love from economics", "think like an owner"],
    whatNotToCopy: ["do not use operating admiration to skip valuation, competition, and governance analysis"],
    guardrailRelevance: ["product_quality_overweight", "value_capture_missing", "valuation_expectation_missing", "source_quality_weak"],
    vector: { narrative_sensitivity: 62, valuation_discipline: 72, evidence_threshold: 78, falsifiability_discipline: 74, time_horizon_clarity: 86, research_loop_tendency: 54, contrarian_impulse: 54, product_founder_bias: 82, downside_first_thinking: 72, catalyst_dependence: 18, cycle_regime_sensitivity: 42, systematic_vs_discretionary: 34, concentration_comfort: 76, authority_reliance: 18, value_capture_clarity: 86 }
  },
  {
    id: "philip_fisher",
    displayName: "Philip Fisher",
    region: "United States",
    tier: "canonical",
    category: "Quality growth / compounders",
    styleTags: ["scuttlebutt", "growth", "quality", "management_quality"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Philip_Arthur_Fisher",
    readMoreUrl: "https://en.wikipedia.org/wiki/Common_Stocks_and_Uncommon_Profits",
    sources: [
      { title: "Philip Fisher biography", url: "https://en.wikipedia.org/wiki/Philip_Arthur_Fisher", quality: "biography", notes: "Biography and book context." },
      { title: "Common Stocks and Uncommon Profits", url: "https://en.wikipedia.org/wiki/Common_Stocks_and_Uncommon_Profits", quality: "book", notes: "Book context for scuttlebutt and growth-company analysis." },
      shared.grahamDoddsville
    ],
    teaches: ["scuttlebutt", "qualitative business research", "management quality", "long-term growth durability"],
    commonMisreadings: ["qualitative conviction is not evidence-free conviction", "growth quality still needs expectations discipline", "talking to sources is not the same as verification"],
    bioSummary: "Philip Fisher was a growth investor and author known for qualitative business research and the scuttlebutt method.",
    investmentStyle: "Long-horizon quality-growth investing focused on management, innovation, sales potential, and qualitative evidence gathered from business networks.",
    notableResultsSummary: "His book Common Stocks and Uncommon Profits is a durable source for the qualitative growth-investing process associated with his name.",
    whatToLearn: ["interview the ecosystem", "study business quality before quarterly noise", "make qualitative evidence explicit"],
    whatNotToCopy: ["do not let a compelling business story replace valuation and falsification discipline"],
    guardrailRelevance: ["valuation_expectation_missing", "falsification_missing", "value_capture_missing", "management_shortcut"],
    vector: { narrative_sensitivity: 78, valuation_discipline: 58, evidence_threshold: 80, falsifiability_discipline: 66, time_horizon_clarity: 90, research_loop_tendency: 70, contrarian_impulse: 46, product_founder_bias: 72, downside_first_thinking: 54, catalyst_dependence: 18, cycle_regime_sensitivity: 36, systematic_vs_discretionary: 30, concentration_comfort: 72, authority_reliance: 22, value_capture_clarity: 78 }
  },
  {
    id: "t_rowe_price_jr",
    displayName: "T. Rowe Price Jr.",
    region: "United States",
    tier: "extended",
    category: "Quality growth / compounders",
    styleTags: ["growth_investing", "long_term_growth", "business_lifecycle"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Thomas_Rowe_Price_Jr.",
    readMoreUrl: "https://www.troweprice.com/corporate/us/en/what-we-do/history.html",
    sources: [
      { title: "T. Rowe Price Jr. biography", url: "https://en.wikipedia.org/wiki/Thomas_Rowe_Price_Jr.", quality: "biography", notes: "Biography and growth-stock context." },
      { title: "T. Rowe Price company history", url: "https://www.troweprice.com/corporate/us/en/what-we-do/history.html", quality: "official", notes: "Official firm history for founder context." },
      { title: "T. Rowe Price mutual fund history", url: "https://en.wikipedia.org/wiki/T._Rowe_Price", quality: "reliable_secondary", notes: "Firm context and growth-investing heritage." }
    ],
    teaches: ["growth durability", "business lifecycle", "compounder patience", "earnings power over time"],
    commonMisreadings: ["growth is not momentum by another name", "long-run durability still needs price expectations", "institutional history is not a stock thesis"],
    bioSummary: "T. Rowe Price Jr. founded the investment firm bearing his name and is associated with growth-stock investing and long-term business lifecycle analysis.",
    investmentStyle: "Long-term growth investing focused on companies with durable expansion potential and compounding earnings power.",
    notableResultsSummary: "His significance is primarily as an early architect of growth-investing practice and the founder of T. Rowe Price.",
    whatToLearn: ["map business lifecycle", "ask whether growth can endure", "connect growth to expectations"],
    whatNotToCopy: ["do not assume a growing company is attractive without asking what growth is already priced in"],
    guardrailRelevance: ["valuation_expectation_missing", "time_horizon_missing", "scenario_absent"],
    vector: { narrative_sensitivity: 68, valuation_discipline: 60, evidence_threshold: 72, falsifiability_discipline: 66, time_horizon_clarity: 88, research_loop_tendency: 56, contrarian_impulse: 34, product_founder_bias: 58, downside_first_thinking: 48, catalyst_dependence: 16, cycle_regime_sensitivity: 40, systematic_vs_discretionary: 42, concentration_comfort: 48, authority_reliance: 18, value_capture_clarity: 74 }
  },
  {
    id: "peter_lynch",
    displayName: "Peter Lynch",
    region: "United States",
    tier: "canonical",
    category: "Quality growth / compounders",
    styleTags: ["garp", "know_what_you_own", "consumer_insight", "simple_thesis"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Peter_Lynch",
    readMoreUrl: "https://en.wikipedia.org/wiki/Peter_Lynch",
    sources: [
      { title: "Peter Lynch biography", url: "https://en.wikipedia.org/wiki/Peter_Lynch", quality: "biography", notes: "Biography and Magellan Fund context." },
      { title: "One Up on Wall Street", url: "https://en.wikipedia.org/wiki/One_Up_on_Wall_Street", quality: "book", notes: "Book context for knowing what you own and consumer observations." },
      { title: "Beating the Street", url: "https://en.wikipedia.org/wiki/Beating_the_Street", quality: "book", notes: "Book context for thesis articulation and company categories." }
    ],
    teaches: ["know what you own", "simple thesis language", "consumer observation", "growth at a reasonable price"],
    commonMisreadings: ["liking a product is not enough", "simple thesis is not shallow thesis", "consumer familiarity still needs financial evidence"],
    bioSummary: "Peter Lynch is a former Fidelity Magellan Fund manager and author known for GARP, consumer observation, and clear thesis language.",
    investmentStyle: "Growth at a reasonable price with emphasis on understandable businesses, company categories, simple thesis articulation, and fundamental follow-through.",
    notableResultsSummary: "His public profile is tied to the Magellan Fund era and widely read books about individual-investor research process.",
    whatToLearn: ["state the thesis simply", "know what would make the story wrong", "tie consumer observations to fundamentals"],
    whatNotToCopy: ["do not buy because a product is familiar before checking economics and valuation"],
    guardrailRelevance: ["product_quality_overweight", "valuation_expectation_missing", "single_metric_overweight", "wording_vague"],
    vector: { narrative_sensitivity: 70, valuation_discipline: 66, evidence_threshold: 70, falsifiability_discipline: 68, time_horizon_clarity: 76, research_loop_tendency: 42, contrarian_impulse: 46, product_founder_bias: 76, downside_first_thinking: 48, catalyst_dependence: 24, cycle_regime_sensitivity: 38, systematic_vs_discretionary: 38, concentration_comfort: 36, authority_reliance: 18, value_capture_clarity: 76 }
  },
  {
    id: "terry_smith",
    displayName: "Terry Smith",
    region: "United Kingdom",
    tier: "modern_case",
    category: "Quality growth / compounders",
    styleTags: ["quality_compounders", "buy_good_companies", "long_term_ownership"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Terry_Smith_(fund_manager)",
    readMoreUrl: "https://www.fundsmith.co.uk/",
    sources: [
      { title: "Terry Smith biography", url: "https://en.wikipedia.org/wiki/Terry_Smith_(fund_manager)", quality: "biography", notes: "Biography and Fundsmith context." },
      { title: "Fundsmith owner manuals and letters", url: "https://www.fundsmith.co.uk/fundsmith-equity-fund/fundsmith-equity-fund-owner-s-manual/", quality: "primary", notes: "Primary firm material for quality-compounder philosophy." },
      { title: "Fundsmith annual letters", url: "https://www.fundsmith.co.uk/fundsmith-equity-fund/documents/", quality: "primary", notes: "Primary fund documents and commentary." }
    ],
    teaches: ["quality filters", "do not overtrade", "free cash flow focus", "quality versus valuation tension"],
    commonMisreadings: ["quality company is not any-price security", "low turnover is not refusal to revisit", "brand quality still needs return math"],
    bioSummary: "Terry Smith is a UK fund manager associated with Fundsmith and a quality-compounder philosophy summarized as buying good companies and holding them.",
    investmentStyle: "Quality-compounder investing emphasizing resilient businesses, high returns on capital, cash generation, and low turnover.",
    notableResultsSummary: "Fundsmith documents and owner manuals provide source-backed material for the stated process and quality criteria.",
    whatToLearn: ["define quality explicitly", "watch free cash flow", "avoid unnecessary trading"],
    whatNotToCopy: ["do not make quality a reason to ignore valuation compression risk"],
    guardrailRelevance: ["quality_without_price", "valuation_expectation_missing", "scenario_absent"],
    vector: { narrative_sensitivity: 58, valuation_discipline: 66, evidence_threshold: 78, falsifiability_discipline: 72, time_horizon_clarity: 90, research_loop_tendency: 48, contrarian_impulse: 34, product_founder_bias: 58, downside_first_thinking: 62, catalyst_dependence: 12, cycle_regime_sensitivity: 34, systematic_vs_discretionary: 52, concentration_comfort: 68, authority_reliance: 14, value_capture_clarity: 82 }
  },
  {
    id: "howard_marks",
    displayName: "Howard Marks",
    region: "United States",
    tier: "canonical",
    category: "Contrarian / risk / cycles",
    styleTags: ["second_level_thinking", "risk_cycles", "credit", "contrarian_risk_awareness"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Howard_Marks_(investor)",
    readMoreUrl: "https://www.oaktreecapital.com/insights/memo",
    sources: [
      shared.oaktreeMemos,
      { title: "Howard Marks biography", url: "https://en.wikipedia.org/wiki/Howard_Marks_(investor)", quality: "biography", notes: "Biography and Oaktree context." },
      { title: "The Most Important Thing", url: "https://en.wikipedia.org/wiki/The_Most_Important_Thing_(book)", quality: "book", notes: "Book context for risk and second-level thinking." }
    ],
    teaches: ["second-level thinking", "risk is not volatility alone", "cycle awareness", "prepare rather than predict"],
    commonMisreadings: ["being contrarian is not enough", "risk language is not bearishness", "cycle awareness is not macro certainty"],
    bioSummary: "Howard Marks is co-founder of Oaktree Capital Management and is known for memos about risk, cycles, and second-level thinking.",
    investmentStyle: "Risk-aware credit and value investing focused on cycles, price, consensus expectations, and asymmetric risk/reward.",
    notableResultsSummary: "Oaktree memos are a durable primary source for Marks's process language around risk, cycles, and market psychology.",
    whatToLearn: ["ask what consensus already believes", "separate risk from volatility", "prepare for multiple states"],
    whatNotToCopy: ["do not turn cycle caution into unsupported macro prediction"],
    guardrailRelevance: ["consensus_gap_missing", "cyclicality_ignored", "macro_certainty", "downside_protocol_missing"],
    vector: { narrative_sensitivity: 44, valuation_discipline: 86, evidence_threshold: 84, falsifiability_discipline: 86, time_horizon_clarity: 78, research_loop_tendency: 58, contrarian_impulse: 82, product_founder_bias: 18, downside_first_thinking: 94, catalyst_dependence: 48, cycle_regime_sensitivity: 88, systematic_vs_discretionary: 52, concentration_comfort: 46, authority_reliance: 12, value_capture_clarity: 78 }
  },
  {
    id: "john_templeton",
    displayName: "John Templeton",
    region: "United States / United Kingdom",
    tier: "canonical",
    category: "Contrarian / risk / cycles",
    styleTags: ["global_contrarian", "peak_pessimism", "value", "international"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/John_Templeton",
    readMoreUrl: "https://www.templeton.org/about/sir-john",
    sources: [
      { title: "John Templeton biography", url: "https://en.wikipedia.org/wiki/John_Templeton", quality: "biography", notes: "Biography and Templeton fund context." },
      { title: "Templeton Foundation biography", url: "https://www.templeton.org/about/sir-john", quality: "official", notes: "Official biographical source." },
      { title: "Franklin Templeton history", url: "https://www.franklintempleton.com/about-us/company-profile", quality: "official", notes: "Firm context for Templeton legacy." }
    ],
    teaches: ["global opportunity set", "peak pessimism", "contrarian discipline", "valuation across borders"],
    commonMisreadings: ["pessimism alone is not margin of safety", "foreign market cheapness needs governance and currency checks", "contrarian does not mean reflexively opposite"],
    bioSummary: "John Templeton was a global investor and philanthropist associated with contrarian investing and looking for value in neglected markets.",
    investmentStyle: "Global contrarian value investing that seeks pessimism-driven mispricing while maintaining valuation and diversification discipline.",
    notableResultsSummary: "Public sources emphasize Templeton's role in globalizing value investing and his peak-pessimism framing.",
    whatToLearn: ["define consensus pessimism", "compare globally", "demand valuation support"],
    whatNotToCopy: ["do not buy merely because a country, sector, or stock is disliked"],
    guardrailRelevance: ["consensus_gap_missing", "cyclicality_ignored", "source_quality_weak"],
    vector: { narrative_sensitivity: 42, valuation_discipline: 86, evidence_threshold: 76, falsifiability_discipline: 72, time_horizon_clarity: 82, research_loop_tendency: 44, contrarian_impulse: 92, product_founder_bias: 18, downside_first_thinking: 72, catalyst_dependence: 34, cycle_regime_sensitivity: 70, systematic_vs_discretionary: 48, concentration_comfort: 34, authority_reliance: 16, value_capture_clarity: 68 }
  },
  {
    id: "jeremy_grantham",
    displayName: "Jeremy Grantham",
    region: "United Kingdom / United States",
    tier: "modern_case",
    category: "Contrarian / risk / cycles",
    styleTags: ["bubbles", "long_term_valuation", "mean_reversion", "regime_caution"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Jeremy_Grantham",
    readMoreUrl: "https://www.gmo.com/americas/research-library/",
    sources: [
      { title: "Jeremy Grantham biography", url: "https://en.wikipedia.org/wiki/Jeremy_Grantham", quality: "biography", notes: "Biography and GMO context." },
      { title: "GMO research library", url: "https://www.gmo.com/americas/research-library/", quality: "primary", notes: "Primary firm research and letters." },
      { title: "GMO asset class forecasts", url: "https://www.gmo.com/americas/research-library/gmo-7-year-asset-class-forecast/", quality: "research", notes: "Useful for valuation and mean-reversion process context; forecasts are not advice for this skill." }
    ],
    teaches: ["bubble detection", "mean reversion", "long-term valuation", "regime caution"],
    commonMisreadings: ["bubble risk does not specify timing", "valuation forecasts are not trade signals", "being early can be a process problem"],
    bioSummary: "Jeremy Grantham is co-founder of GMO and is publicly associated with long-term valuation, bubbles, and mean-reversion warnings.",
    investmentStyle: "Valuation-driven, contrarian, long-horizon asset-class and market-cycle thinking with emphasis on bubbles and mean reversion.",
    notableResultsSummary: "GMO letters and research provide source-backed process context for valuation discipline and bubble-risk framing.",
    whatToLearn: ["ask what valuation implies", "separate long-term expected return from timing", "name bubble risk carefully"],
    whatNotToCopy: ["do not turn long-term valuation concern into a precise timing claim"],
    guardrailRelevance: ["macro_story_overreach", "cyclicality_ignored", "valuation_expectation_missing", "time_horizon_missing"],
    vector: { narrative_sensitivity: 48, valuation_discipline: 92, evidence_threshold: 86, falsifiability_discipline: 80, time_horizon_clarity: 86, research_loop_tendency: 58, contrarian_impulse: 86, product_founder_bias: 14, downside_first_thinking: 86, catalyst_dependence: 28, cycle_regime_sensitivity: 94, systematic_vs_discretionary: 62, concentration_comfort: 36, authority_reliance: 14, value_capture_clarity: 70 }
  },
  {
    id: "michael_burry",
    displayName: "Michael Burry",
    region: "United States",
    tier: "controversial_case",
    category: "Contrarian / risk / cycles",
    styleTags: ["contrarian", "deep_research", "asymmetric_bets", "short_selling"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Michael_Burry",
    readMoreUrl: "https://en.wikipedia.org/wiki/Michael_Burry",
    sources: [
      { title: "Michael Burry biography", url: "https://en.wikipedia.org/wiki/Michael_Burry", quality: "biography", notes: "Biography and public context around Scion and subprime thesis." },
      { title: "Scion Asset Management SEC filings", url: "https://www.sec.gov/edgar/browse/?CIK=1649339", quality: "public_record", notes: "Public filings context; incomplete for full strategy." },
      { title: "The Big Short", url: "https://en.wikipedia.org/wiki/The_Big_Short", quality: "book", notes: "Secondary narrative around subprime thesis; use cautiously for process context." }
    ],
    teaches: ["variant perception", "asymmetric payoff", "deep document research", "evidence against consensus"],
    commonMisreadings: ["dramatic short calls are not a reusable process", "being early can be costly", "public tweets are not research"],
    bioSummary: "Michael Burry is a physician-turned-investor known publicly for contrarian research and his role in the subprime mortgage short thesis.",
    investmentStyle: "Contrarian, evidence-heavy, sometimes concentrated investing that seeks asymmetric setups where consensus appears materially wrong.",
    notableResultsSummary: "His best-known public case is the subprime mortgage thesis; use it as a process case, not a template for current decisions.",
    whatToLearn: ["build evidence against consensus", "define payoff asymmetry", "read primary documents"],
    whatNotToCopy: ["do not copy the drama of a contrarian call without the evidence and risk protocol"],
    guardrailRelevance: ["consensus_gap_missing", "downside_protocol_missing", "authority_anchor", "source_quality_weak"],
    vector: { narrative_sensitivity: 46, valuation_discipline: 82, evidence_threshold: 94, falsifiability_discipline: 86, time_horizon_clarity: 70, research_loop_tendency: 76, contrarian_impulse: 96, product_founder_bias: 12, downside_first_thinking: 86, catalyst_dependence: 72, cycle_regime_sensitivity: 82, systematic_vs_discretionary: 32, concentration_comfort: 88, authority_reliance: 8, value_capture_clarity: 74 }
  },
  {
    id: "george_soros",
    displayName: "George Soros",
    region: "United States / Hungary",
    tier: "canonical",
    category: "Macro / trading / reflexivity",
    styleTags: ["reflexivity", "macro", "asymmetric_bets", "fallibility"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/George_Soros",
    readMoreUrl: "https://www.opensocietyfoundations.org/george-soros",
    sources: [
      { title: "George Soros biography", url: "https://en.wikipedia.org/wiki/George_Soros", quality: "biography", notes: "Biography and Quantum Fund context." },
      { title: "The Alchemy of Finance", url: "https://en.wikipedia.org/wiki/The_Alchemy_of_Finance", quality: "book", notes: "Book context for reflexivity and fallibility." },
      { title: "Open Society Foundations biography", url: "https://www.opensocietyfoundations.org/george-soros", quality: "official", notes: "Official biographical source." }
    ],
    teaches: ["reflexivity", "fallibility", "macro feedback loops", "asymmetric positioning"],
    commonMisreadings: ["reflexivity is not license for vague macro stories", "large macro bets require risk controls", "fallibility means revising, not just predicting"],
    bioSummary: "George Soros is an investor and philanthropist associated with macro investing, reflexivity theory, and the Quantum Fund era.",
    investmentStyle: "Discretionary global macro investing focused on reflexive feedback loops, changing expectations, and asymmetric opportunities.",
    notableResultsSummary: "Public sources are most useful for reflexivity and macro process context rather than for copying specific trades.",
    whatToLearn: ["ask how beliefs change reality", "watch feedback loops", "stay open to being wrong"],
    whatNotToCopy: ["do not convert macro narrative into action without falsification and risk boundaries"],
    guardrailRelevance: ["macro_story_overreach", "falsification_missing", "downside_protocol_missing", "scenario_absent"],
    vector: { narrative_sensitivity: 78, valuation_discipline: 48, evidence_threshold: 76, falsifiability_discipline: 88, time_horizon_clarity: 66, research_loop_tendency: 56, contrarian_impulse: 84, product_founder_bias: 10, downside_first_thinking: 76, catalyst_dependence: 72, cycle_regime_sensitivity: 96, systematic_vs_discretionary: 18, concentration_comfort: 90, authority_reliance: 10, value_capture_clarity: 62 }
  },
  {
    id: "stanley_druckenmiller",
    displayName: "Stanley Druckenmiller",
    region: "United States",
    tier: "canonical",
    category: "Macro / trading / reflexivity",
    styleTags: ["macro", "concentrated_bets", "risk_management", "liquidity"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Stanley_Druckenmiller",
    readMoreUrl: "https://en.wikipedia.org/wiki/Stanley_Druckenmiller",
    sources: [
      { title: "Stanley Druckenmiller biography", url: "https://en.wikipedia.org/wiki/Stanley_Druckenmiller", quality: "biography", notes: "Biography and Duquesne context." },
      { title: "Duquesne Family Office SEC filings", url: "https://www.sec.gov/edgar/browse/?CIK=1536411", quality: "public_record", notes: "Public filings context; incomplete for macro exposures." },
      { title: "The New Market Wizards", url: "https://en.wikipedia.org/wiki/Market_Wizards", quality: "book", notes: "Interview source family for trading and risk process context." }
    ],
    teaches: ["risk management", "concentrate when evidence is strong", "liquidity awareness", "change mind quickly"],
    commonMisreadings: ["concentration is not bravado", "macro conviction still needs invalidation", "public 13F data is incomplete for macro process"],
    bioSummary: "Stanley Druckenmiller is a macro investor known for Duquesne Capital and for public discussions of concentrated, risk-managed investing.",
    investmentStyle: "Discretionary macro investing that combines concentrated conviction with strict attention to liquidity, risk, and changing evidence.",
    notableResultsSummary: "Public biography, interviews, and filings provide process context; the skill avoids precise performance claims.",
    whatToLearn: ["size conviction through process, not excitement", "change mind when facts change", "make risk explicit"],
    whatNotToCopy: ["do not imitate concentration without a risk protocol"],
    guardrailRelevance: ["downside_protocol_missing", "macro_story_overreach", "falsification_missing", "position_protocol_missing"],
    vector: { narrative_sensitivity: 64, valuation_discipline: 54, evidence_threshold: 82, falsifiability_discipline: 88, time_horizon_clarity: 72, research_loop_tendency: 44, contrarian_impulse: 68, product_founder_bias: 10, downside_first_thinking: 82, catalyst_dependence: 76, cycle_regime_sensitivity: 96, systematic_vs_discretionary: 24, concentration_comfort: 96, authority_reliance: 8, value_capture_clarity: 62 }
  },
  {
    id: "paul_tudor_jones",
    displayName: "Paul Tudor Jones",
    region: "United States",
    tier: "canonical",
    category: "Macro / trading / reflexivity",
    styleTags: ["trading", "macro", "risk_control", "loss_control"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Paul_Tudor_Jones",
    readMoreUrl: "https://www.tudor.com/",
    sources: [
      { title: "Paul Tudor Jones biography", url: "https://en.wikipedia.org/wiki/Paul_Tudor_Jones", quality: "biography", notes: "Biography and Tudor Investment context." },
      { title: "Tudor Investment Corporation", url: "https://www.tudor.com/", quality: "official", notes: "Official firm context." },
      { title: "Market Wizards", url: "https://en.wikipedia.org/wiki/Market_Wizards", quality: "book", notes: "Interview source family for trading process and loss control." }
    ],
    teaches: ["loss control", "timing discipline", "trading risk boundaries", "humility under uncertainty"],
    commonMisreadings: ["trading skill does not translate to casual timing", "stop-loss language is not a substitute for thesis", "macro view needs execution discipline"],
    bioSummary: "Paul Tudor Jones is a trader and macro investor associated with Tudor Investment Corporation and public emphasis on risk control.",
    investmentStyle: "Macro and trading-oriented investing with strong emphasis on loss control, timing, and disciplined risk management.",
    notableResultsSummary: "Public sources are most useful for process ideas around risk, trading discipline, and drawdown control.",
    whatToLearn: ["predefine loss control", "separate thesis from trade timing", "respect uncertainty"],
    whatNotToCopy: ["do not apply trading instincts to long-term investing without a clear process"],
    guardrailRelevance: ["downside_protocol_missing", "time_horizon_missing", "macro_story_overreach"],
    vector: { narrative_sensitivity: 56, valuation_discipline: 42, evidence_threshold: 78, falsifiability_discipline: 86, time_horizon_clarity: 72, research_loop_tendency: 34, contrarian_impulse: 58, product_founder_bias: 8, downside_first_thinking: 92, catalyst_dependence: 84, cycle_regime_sensitivity: 92, systematic_vs_discretionary: 38, concentration_comfort: 76, authority_reliance: 8, value_capture_clarity: 54 }
  },
  {
    id: "jesse_livermore",
    displayName: "Jesse Livermore",
    region: "United States",
    tier: "controversial_case",
    category: "Macro / trading / reflexivity",
    styleTags: ["speculation", "tape_reading", "risk", "cautionary_archetype"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Jesse_Livermore",
    readMoreUrl: "https://en.wikipedia.org/wiki/Jesse_Livermore",
    sources: [
      { title: "Jesse Livermore biography", url: "https://en.wikipedia.org/wiki/Jesse_Livermore", quality: "biography", notes: "Biography and cautionary context." },
      { title: "Reminiscences of a Stock Operator", url: "https://en.wikipedia.org/wiki/Reminiscences_of_a_Stock_Operator", quality: "book", notes: "Fictionalized account often associated with trading psychology; use cautiously." },
      { title: "How to Trade in Stocks", url: "https://en.wikipedia.org/wiki/Jesse_Livermore#Books", quality: "book", notes: "Book context, not a modern recommendation source." }
    ],
    teaches: ["speculation caution", "risk of leverage", "price action discipline", "psychological fragility"],
    commonMisreadings: ["legendary trades do not make a risk process", "tape reading is not investment research", "cautionary cases are not avatars to emulate"],
    bioSummary: "Jesse Livermore was a famous speculator whose life is often used as both a trading psychology case and a cautionary risk story.",
    investmentStyle: "Speculative trading archetype centered on price action, timing, and crowd behavior, best used in this product as a warning lens.",
    notableResultsSummary: "His public significance is as a historical trading figure and cautionary case about speculation, leverage, and psychology.",
    whatToLearn: ["respect leverage and ruin risk", "do not confuse price action with business analysis", "define loss boundaries"],
    whatNotToCopy: ["do not romanticize speculation or ignore life-cycle and leverage risk"],
    guardrailRelevance: ["downside_protocol_missing", "narrative_to_action_jump", "time_horizon_missing"],
    vector: { narrative_sensitivity: 48, valuation_discipline: 18, evidence_threshold: 58, falsifiability_discipline: 70, time_horizon_clarity: 54, research_loop_tendency: 18, contrarian_impulse: 60, product_founder_bias: 4, downside_first_thinking: 76, catalyst_dependence: 90, cycle_regime_sensitivity: 72, systematic_vs_discretionary: 28, concentration_comfort: 86, authority_reliance: 8, value_capture_clarity: 28 }
  },
  {
    id: "ray_dalio",
    displayName: "Ray Dalio",
    region: "United States",
    tier: "canonical",
    category: "Macro / trading / reflexivity",
    styleTags: ["macro", "risk_parity", "principles", "regime_map"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Ray_Dalio",
    readMoreUrl: "https://www.bridgewater.com/research-and-insights",
    sources: [
      { title: "Ray Dalio biography", url: "https://en.wikipedia.org/wiki/Ray_Dalio", quality: "biography", notes: "Biography and Bridgewater context." },
      { title: "Bridgewater research and insights", url: "https://www.bridgewater.com/research-and-insights", quality: "primary", notes: "Primary firm source for macro and portfolio principles." },
      { title: "Principles", url: "https://en.wikipedia.org/wiki/Principles_(book)", quality: "book", notes: "Book context for decision principles and process culture." }
    ],
    teaches: ["regime mapping", "diversification", "principles", "economic machine framing"],
    commonMisreadings: ["principles are not automatic truth", "macro frameworks can over-explain", "diversification is not a personal allocation recommendation"],
    bioSummary: "Ray Dalio founded Bridgewater Associates and is associated with macro frameworks, risk parity, and principles-based process.",
    investmentStyle: "Macro and portfolio-process investing that emphasizes economic regimes, diversification, systematic principles, and scenario thinking.",
    notableResultsSummary: "Bridgewater research and Dalio's public writing are useful for macro-regime and process language, not for personalized allocation advice.",
    whatToLearn: ["map regimes", "write explicit principles", "think in scenarios"],
    whatNotToCopy: ["do not let a macro framework replace asset-specific evidence"],
    guardrailRelevance: ["macro_story_overreach", "scenario_absent", "cycle_regime_guardrail"],
    vector: { narrative_sensitivity: 70, valuation_discipline: 48, evidence_threshold: 82, falsifiability_discipline: 78, time_horizon_clarity: 82, research_loop_tendency: 66, contrarian_impulse: 52, product_founder_bias: 8, downside_first_thinking: 78, catalyst_dependence: 40, cycle_regime_sensitivity: 98, systematic_vs_discretionary: 82, concentration_comfort: 28, authority_reliance: 20, value_capture_clarity: 54 }
  },
  {
    id: "john_bogle",
    displayName: "John C. Bogle",
    region: "United States",
    tier: "canonical",
    category: "Systematic / quant / passive",
    styleTags: ["indexing", "low_cost", "passive_investing", "humility"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/John_C._Bogle",
    readMoreUrl: "https://corporate.vanguard.com/content/corporatesite/us/en/corp/who-we-are/sets-us-apart/indexing-history.html",
    sources: [
      { title: "John C. Bogle biography", url: "https://en.wikipedia.org/wiki/John_C._Bogle", quality: "biography", notes: "Biography and Vanguard context." },
      { title: "Vanguard Bogle history", url: "https://corporate.vanguard.com/content/corporatesite/us/en/corp/who-we-are/sets-us-apart/indexing-history.html", quality: "official", notes: "Official Vanguard source for index-fund history." },
      { title: "Bogleheads investment philosophy", url: "https://www.bogleheads.org/wiki/Bogleheads%C2%AE_investment_philosophy", quality: "reliable_secondary", notes: "Community educational summary; not primary but useful for philosophy framing." }
    ],
    teaches: ["cost discipline", "market humility", "indexing", "avoid unnecessary complexity"],
    commonMisreadings: ["humility is not apathy", "passive principles are not a stock-picking thesis", "low cost does not eliminate risk"],
    bioSummary: "John C. Bogle founded Vanguard and is associated with low-cost index investing and investor-cost discipline.",
    investmentStyle: "Passive, low-cost, broad-market investing philosophy centered on humility, costs, diversification, and long-term compounding.",
    notableResultsSummary: "His historical importance is the popularization of low-cost indexing and the investor-first mutual fund structure at Vanguard.",
    whatToLearn: ["ask whether active edge is real", "control costs", "prefer simple processes when evidence is weak"],
    whatNotToCopy: ["do not use passive humility to avoid clarifying an active thesis when you are making one"],
    guardrailRelevance: ["authority_anchor", "source_quality_weak", "evidence_basis_missing"],
    vector: { narrative_sensitivity: 16, valuation_discipline: 60, evidence_threshold: 82, falsifiability_discipline: 82, time_horizon_clarity: 88, research_loop_tendency: 22, contrarian_impulse: 24, product_founder_bias: 4, downside_first_thinking: 70, catalyst_dependence: 4, cycle_regime_sensitivity: 30, systematic_vs_discretionary: 96, concentration_comfort: 8, authority_reliance: 10, value_capture_clarity: 48 }
  },
  {
    id: "jim_simons",
    displayName: "Jim Simons",
    region: "United States",
    tier: "canonical",
    category: "Systematic / quant / passive",
    styleTags: ["quant", "systematic", "data", "statistical_edge"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Jim_Simons_(mathematician)",
    readMoreUrl: "https://www.simonsfoundation.org/people/james-h-simons/",
    sources: [
      { title: "Jim Simons biography", url: "https://en.wikipedia.org/wiki/Jim_Simons_(mathematician)", quality: "biography", notes: "Biography and Renaissance Technologies context." },
      { title: "Renaissance Technologies", url: "https://en.wikipedia.org/wiki/Renaissance_Technologies", quality: "reliable_secondary", notes: "Firm context and public history." },
      { title: "Simons Foundation biography", url: "https://www.simonsfoundation.org/people/james-h-simons/", quality: "official", notes: "Official biography from Simons Foundation." }
    ],
    teaches: ["statistical edge", "systems over stories", "data quality", "team science"],
    commonMisreadings: ["quant success is not spreadsheet curve-fitting", "public data is not necessarily edge", "black-box mystique is not a process"],
    bioSummary: "Jim Simons was a mathematician, founder of Renaissance Technologies, and philanthropist associated with systematic quantitative investing.",
    investmentStyle: "Systematic quantitative investing based on statistical signals, data infrastructure, modeling, and rigorous research culture.",
    notableResultsSummary: "Public sources support his role as a leading quant pioneer; precise fund records should be handled cautiously and not used as ranking claims.",
    whatToLearn: ["prefer tested signals over stories", "respect data quality", "separate intuition from measurable edge"],
    whatNotToCopy: ["do not call a simple backtest a Renaissance-style process"],
    guardrailRelevance: ["single_metric_overweight", "source_quality_weak", "evidence_basis_missing"],
    vector: { narrative_sensitivity: 8, valuation_discipline: 44, evidence_threshold: 98, falsifiability_discipline: 94, time_horizon_clarity: 68, research_loop_tendency: 82, contrarian_impulse: 34, product_founder_bias: 2, downside_first_thinking: 70, catalyst_dependence: 22, cycle_regime_sensitivity: 50, systematic_vs_discretionary: 100, concentration_comfort: 42, authority_reliance: 6, value_capture_clarity: 42 }
  },
  {
    id: "edward_thorp",
    displayName: "Edward O. Thorp",
    region: "United States",
    tier: "canonical",
    category: "Systematic / quant / passive",
    styleTags: ["probability", "arbitrage", "quant", "risk_control"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Edward_O._Thorp",
    readMoreUrl: "https://en.wikipedia.org/wiki/Edward_O._Thorp",
    sources: [
      { title: "Edward O. Thorp biography", url: "https://en.wikipedia.org/wiki/Edward_O._Thorp", quality: "biography", notes: "Biography and blackjack/quant finance context." },
      { title: "A Man for All Markets", url: "https://en.wikipedia.org/wiki/A_Man_for_All_Markets", quality: "book", notes: "Autobiographical source for probability, arbitrage, and risk thinking." },
      { title: "Beat the Dealer", url: "https://en.wikipedia.org/wiki/Beat_the_Dealer", quality: "book", notes: "Book context for probabilistic edge." }
    ],
    teaches: ["probabilistic thinking", "edge measurement", "risk of ruin", "arbitrage logic"],
    commonMisreadings: ["probability language is not certainty", "edge disappears when crowded", "small samples do not prove a system"],
    bioSummary: "Edward O. Thorp is a mathematician, author, and investor associated with card counting, probability, arbitrage, and quantitative finance.",
    investmentStyle: "Quantitative and probabilistic investing focused on measurable edge, arbitrage logic, and risk-of-ruin discipline.",
    notableResultsSummary: "His books and public biography provide source-backed context for applying probability and edge measurement to markets.",
    whatToLearn: ["quantify edge", "consider risk of ruin", "test whether the game is favorable"],
    whatNotToCopy: ["do not overstate precision from thin evidence"],
    guardrailRelevance: ["evidence_basis_missing", "single_metric_overweight", "downside_protocol_missing"],
    vector: { narrative_sensitivity: 12, valuation_discipline: 58, evidence_threshold: 96, falsifiability_discipline: 96, time_horizon_clarity: 72, research_loop_tendency: 72, contrarian_impulse: 44, product_founder_bias: 2, downside_first_thinking: 86, catalyst_dependence: 46, cycle_regime_sensitivity: 42, systematic_vs_discretionary: 96, concentration_comfort: 42, authority_reliance: 4, value_capture_clarity: 54 }
  },
  {
    id: "cliff_asness",
    displayName: "Cliff Asness",
    region: "United States",
    tier: "modern_case",
    category: "Systematic / quant / passive",
    styleTags: ["factor_investing", "value_momentum", "quant", "anti_story"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Cliff_Asness",
    readMoreUrl: "https://www.aqr.com/Insights/Research",
    sources: [
      { title: "Cliff Asness biography", url: "https://en.wikipedia.org/wiki/Cliff_Asness", quality: "biography", notes: "Biography and AQR context." },
      shared.aqrResearch,
      { title: "AQR Alternative Thinking", url: "https://www.aqr.com/Insights/Perspectives", quality: "research", notes: "Practitioner perspectives for factor discipline and market commentary." }
    ],
    teaches: ["factor discipline", "anti-story evidence", "value and momentum", "long-horizon process pain"],
    commonMisreadings: ["factor labels are not magic words", "underperformance does not instantly falsify a long-horizon factor", "statistics still need implementation discipline"],
    bioSummary: "Cliff Asness is co-founder of AQR Capital Management and is associated with systematic factor investing and quantitative research.",
    investmentStyle: "Systematic factor investing that emphasizes evidence, diversification across signals, value, momentum, and disciplined implementation.",
    notableResultsSummary: "AQR research is a primary source for his public process language around factors and systematic investing.",
    whatToLearn: ["ask for base-rate evidence", "separate story from factor exposure", "prepare for painful tracking error"],
    whatNotToCopy: ["do not slap factor terms onto discretionary narratives without evidence"],
    guardrailRelevance: ["source_quality_weak", "single_metric_overweight", "scenario_absent"],
    vector: { narrative_sensitivity: 16, valuation_discipline: 78, evidence_threshold: 94, falsifiability_discipline: 90, time_horizon_clarity: 80, research_loop_tendency: 68, contrarian_impulse: 58, product_founder_bias: 4, downside_first_thinking: 72, catalyst_dependence: 18, cycle_regime_sensitivity: 58, systematic_vs_discretionary: 98, concentration_comfort: 24, authority_reliance: 8, value_capture_clarity: 58 }
  },
  {
    id: "eugene_fama",
    displayName: "Eugene Fama",
    region: "United States",
    tier: "canonical",
    category: "Systematic / quant / passive",
    styleTags: ["efficient_markets", "factor_research", "academic_finance", "market_humility"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Eugene_Fama",
    readMoreUrl: "https://www.nobelprize.org/prizes/economic-sciences/2013/fama/facts/",
    sources: [
      { title: "Eugene Fama biography", url: "https://en.wikipedia.org/wiki/Eugene_Fama", quality: "biography", notes: "Biography and Nobel Prize context." },
      { title: "Fama-French research library", url: "https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html", quality: "research", notes: "Research data library associated with factor research." },
      { title: "Nobel Prize biography", url: "https://www.nobelprize.org/prizes/economic-sciences/2013/fama/facts/", quality: "official", notes: "Official Nobel source for research contribution context." }
    ],
    teaches: ["market efficiency discipline", "base rates", "factor evidence", "humility about edge"],
    commonMisreadings: ["efficient markets are not perfectly priced markets", "factor evidence is not security-specific advice", "academic evidence needs implementation context"],
    bioSummary: "Eugene Fama is an economist associated with efficient market research and factor models in empirical asset pricing.",
    investmentStyle: "Academic, evidence-first market-efficiency lens that pushes investors to justify active edge and separate risk factors from stories.",
    notableResultsSummary: "His Nobel-recognized research and factor work provide source-backed context for market-efficiency guardrails.",
    whatToLearn: ["ask why you have edge", "use base rates", "separate systematic exposure from skill"],
    whatNotToCopy: ["do not use market efficiency as a reason to stop thinking about process"],
    guardrailRelevance: ["evidence_basis_missing", "authority_anchor", "source_quality_weak"],
    vector: { narrative_sensitivity: 8, valuation_discipline: 62, evidence_threshold: 98, falsifiability_discipline: 94, time_horizon_clarity: 78, research_loop_tendency: 64, contrarian_impulse: 22, product_founder_bias: 2, downside_first_thinking: 68, catalyst_dependence: 6, cycle_regime_sensitivity: 44, systematic_vs_discretionary: 100, concentration_comfort: 10, authority_reliance: 8, value_capture_clarity: 46 }
  },
  {
    id: "carl_icahn",
    displayName: "Carl Icahn",
    region: "United States",
    tier: "canonical",
    category: "Activist / special situations",
    styleTags: ["activist", "corporate_control", "governance", "catalyst"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Carl_Icahn",
    readMoreUrl: "https://www.ielp.com/",
    sources: [
      { title: "Carl Icahn biography", url: "https://en.wikipedia.org/wiki/Carl_Icahn", quality: "biography", notes: "Biography and activism context." },
      { title: "Icahn Enterprises", url: "https://www.ielp.com/", quality: "official", notes: "Official company context." },
      { title: "Icahn SEC filings", url: "https://www.sec.gov/edgar/browse/?CIK=921669", quality: "public_record", notes: "Public filings context." }
    ],
    teaches: ["catalyst definition", "governance pressure", "corporate control", "shareholder rights"],
    commonMisreadings: ["activism is not just complaining", "catalyst requires power and process", "public campaigns carry reputational and execution risk"],
    bioSummary: "Carl Icahn is an activist investor associated with corporate control, governance campaigns, and public shareholder activism.",
    investmentStyle: "Activist and special-situation investing that seeks value realization through governance pressure, capital allocation changes, or corporate actions.",
    notableResultsSummary: "His public significance is the development of high-profile activist campaigns and corporate-control investing.",
    whatToLearn: ["define the catalyst", "map governance power", "ask who can force change"],
    whatNotToCopy: ["do not assume a catalyst exists merely because change would be desirable"],
    guardrailRelevance: ["catalyst_missing", "consensus_gap_missing", "downside_protocol_missing"],
    vector: { narrative_sensitivity: 42, valuation_discipline: 76, evidence_threshold: 78, falsifiability_discipline: 76, time_horizon_clarity: 76, research_loop_tendency: 40, contrarian_impulse: 78, product_founder_bias: 8, downside_first_thinking: 70, catalyst_dependence: 96, cycle_regime_sensitivity: 42, systematic_vs_discretionary: 18, concentration_comfort: 88, authority_reliance: 8, value_capture_clarity: 82 }
  },
  {
    id: "bill_ackman",
    displayName: "Bill Ackman",
    region: "United States",
    tier: "modern_case",
    category: "Activist / special situations",
    styleTags: ["activist", "concentrated", "public_campaigns", "thesis_clarity"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Bill_Ackman",
    readMoreUrl: "https://pershingsquareholdings.com/company-reports/letters-to-shareholders/",
    sources: [
      { title: "Bill Ackman biography", url: "https://en.wikipedia.org/wiki/Bill_Ackman", quality: "biography", notes: "Biography and Pershing Square context." },
      { title: "Pershing Square shareholder letters", url: "https://pershingsquareholdings.com/company-reports/letters-to-shareholders/", quality: "primary", notes: "Primary source for public thesis articulation and portfolio commentary." },
      { title: "Pershing Square Holdings reports", url: "https://pershingsquareholdings.com/company-reports/financial-statements/", quality: "primary", notes: "Public company reports for fund context." }
    ],
    teaches: ["public thesis clarity", "activist catalysts", "concentration", "reputational risk"],
    commonMisreadings: ["confidence and presentation do not equal truth", "public thesis can become identity risk", "activism requires specific levers"],
    bioSummary: "Bill Ackman is founder and CEO of Pershing Square Capital Management and is associated with concentrated activist and public-campaign investing.",
    investmentStyle: "Concentrated activist and public-equity investing with strong emphasis on thesis articulation, catalysts, governance, and portfolio-level conviction.",
    notableResultsSummary: "Pershing Square reports and letters offer source-backed examples of public thesis framing and activist-style communication.",
    whatToLearn: ["write the thesis clearly", "state the catalyst", "track reputational and identity risk"],
    whatNotToCopy: ["do not let a public narrative make thesis revision harder"],
    guardrailRelevance: ["catalyst_missing", "falsification_missing", "authority_anchor", "downside_protocol_missing"],
    vector: { narrative_sensitivity: 72, valuation_discipline: 74, evidence_threshold: 82, falsifiability_discipline: 72, time_horizon_clarity: 80, research_loop_tendency: 58, contrarian_impulse: 76, product_founder_bias: 34, downside_first_thinking: 70, catalyst_dependence: 94, cycle_regime_sensitivity: 46, systematic_vs_discretionary: 20, concentration_comfort: 96, authority_reliance: 12, value_capture_clarity: 84 }
  },
  {
    id: "joel_greenblatt",
    displayName: "Joel Greenblatt",
    region: "United States",
    tier: "canonical",
    category: "Activist / special situations",
    styleTags: ["special_situations", "magic_formula", "value", "simple_rules"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Joel_Greenblatt",
    readMoreUrl: "https://en.wikipedia.org/wiki/Joel_Greenblatt",
    sources: [
      { title: "Joel Greenblatt biography", url: "https://en.wikipedia.org/wiki/Joel_Greenblatt", quality: "biography", notes: "Biography and Gotham context." },
      { title: "You Can Be a Stock Market Genius", url: "https://en.wikipedia.org/wiki/Joel_Greenblatt#Bibliography", quality: "book", notes: "Book context for special situations." },
      { title: "The Little Book That Beats the Market", url: "https://en.wikipedia.org/wiki/The_Little_Book_That_Beats_the_Market", quality: "book", notes: "Book context for simple quality/value rules." }
    ],
    teaches: ["special situations", "simple rules", "return on capital and earnings yield", "spin-offs and catalysts"],
    commonMisreadings: ["magic formula is not magic", "special situations need event mechanics", "simple rules still need implementation discipline"],
    bioSummary: "Joel Greenblatt is an investor, professor, and author associated with special situations and simple quality-value frameworks.",
    investmentStyle: "Value and special-situation investing that combines simple quantitative rules with event-driven opportunity analysis.",
    notableResultsSummary: "His books are useful source material for special-situation thinking and simple-rule value frameworks.",
    whatToLearn: ["look for event mechanics", "use simple ranking rules carefully", "connect quality and price"],
    whatNotToCopy: ["do not treat a formula as a substitute for understanding why the opportunity exists"],
    guardrailRelevance: ["catalyst_missing", "single_metric_overweight", "valuation_expectation_missing"],
    vector: { narrative_sensitivity: 34, valuation_discipline: 86, evidence_threshold: 78, falsifiability_discipline: 80, time_horizon_clarity: 76, research_loop_tendency: 44, contrarian_impulse: 66, product_founder_bias: 10, downside_first_thinking: 78, catalyst_dependence: 84, cycle_regime_sensitivity: 34, systematic_vs_discretionary: 74, concentration_comfort: 54, authority_reliance: 10, value_capture_clarity: 78 }
  },
  {
    id: "bill_gross",
    displayName: "Bill Gross",
    region: "United States",
    tier: "canonical",
    category: "Credit / bonds / endowment",
    styleTags: ["bonds", "duration", "fixed_income", "rates"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Bill_Gross",
    readMoreUrl: "https://www.pimco.com/us/en/insights",
    sources: [
      { title: "Bill Gross biography", url: "https://en.wikipedia.org/wiki/Bill_Gross", quality: "biography", notes: "Biography and PIMCO context." },
      { title: "PIMCO insights", url: "https://www.pimco.com/us/en/insights", quality: "primary", notes: "Firm research context for fixed income and macro." },
      { title: "PIMCO history", url: "https://www.pimco.com/us/en/about-us", quality: "official", notes: "Official firm context." }
    ],
    teaches: ["duration awareness", "fixed-income risk", "rate sensitivity", "income versus capital risk"],
    commonMisreadings: ["bonds are not risk-free", "yield is not total return", "duration can dominate narrative"],
    bioSummary: "Bill Gross co-founded PIMCO and is publicly associated with fixed-income investing and bond-market commentary.",
    investmentStyle: "Fixed-income and macro investing focused on rates, duration, credit quality, yield, and bond-market structure.",
    notableResultsSummary: "His public role is most useful for teaching rate and duration awareness rather than for equity-style thesis matching.",
    whatToLearn: ["measure duration", "separate yield from risk", "map rate sensitivity"],
    whatNotToCopy: ["do not import bond-market confidence into equity theses without asset-sensitivity work"],
    guardrailRelevance: ["cycle_regime_guardrail", "macro_story_overreach", "downside_protocol_missing"],
    vector: { narrative_sensitivity: 38, valuation_discipline: 72, evidence_threshold: 78, falsifiability_discipline: 76, time_horizon_clarity: 80, research_loop_tendency: 46, contrarian_impulse: 52, product_founder_bias: 4, downside_first_thinking: 84, catalyst_dependence: 46, cycle_regime_sensitivity: 94, systematic_vs_discretionary: 54, concentration_comfort: 40, authority_reliance: 12, value_capture_clarity: 46 }
  },
  {
    id: "david_swensen",
    displayName: "David Swensen",
    region: "United States",
    tier: "canonical",
    category: "Credit / bonds / endowment",
    styleTags: ["endowment_model", "asset_allocation", "manager_selection", "illiquidity"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/David_F._Swensen",
    readMoreUrl: "https://investments.yale.edu/",
    sources: [
      { title: "David Swensen biography", url: "https://en.wikipedia.org/wiki/David_F._Swensen", quality: "biography", notes: "Biography and Yale endowment context." },
      { title: "Yale Investments Office", url: "https://investments.yale.edu/", quality: "official", notes: "Official endowment source." },
      { title: "Pioneering Portfolio Management", url: "https://en.wikipedia.org/wiki/David_F._Swensen#Works", quality: "book", notes: "Book context for endowment model and portfolio process." }
    ],
    teaches: ["portfolio construction", "manager selection", "illiquidity tradeoffs", "long horizon governance"],
    commonMisreadings: ["endowment model is not simple retail asset allocation", "illiquidity requires governance and time horizon", "manager access is part of the model"],
    bioSummary: "David Swensen was Yale's chief investment officer and is associated with the endowment model, portfolio construction, and alternative assets.",
    investmentStyle: "Institutional portfolio construction emphasizing asset allocation, manager selection, illiquidity premiums, and long-horizon governance.",
    notableResultsSummary: "Public material is strongest for endowment-model principles and institutional process, not for personal allocation recommendations.",
    whatToLearn: ["state portfolio role", "respect liquidity constraints", "separate manager skill from asset exposure"],
    whatNotToCopy: ["do not copy an endowment model without institutional access, governance, and liquidity context"],
    guardrailRelevance: ["portfolio_context_missing", "time_horizon_missing", "downside_protocol_missing"],
    vector: { narrative_sensitivity: 34, valuation_discipline: 68, evidence_threshold: 86, falsifiability_discipline: 78, time_horizon_clarity: 92, research_loop_tendency: 62, contrarian_impulse: 46, product_founder_bias: 6, downside_first_thinking: 82, catalyst_dependence: 20, cycle_regime_sensitivity: 72, systematic_vs_discretionary: 70, concentration_comfort: 22, authority_reliance: 14, value_capture_clarity: 52 }
  }
];
var ACTIVE_MASTER_IDS = MASTER_RECORDS.map((master) => master.id);

// skills/investment-mirror/src/core.ts
var parserVersion = "investment-mirror-parser-v0.2.0";
var scoringVersion = "investment-mirror-scoring-v0.2.0";
var skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
var repoRoot = resolve(skillRoot, "..", "..");
var investmentSignals = [
  "stock",
  "equity",
  "ticker",
  "buy",
  "sell",
  "add",
  "trim",
  "hold",
  "portfolio",
  "valuation",
  "dcf",
  "multiple",
  "revenue growth",
  "margin",
  "moat",
  "market",
  "thesis",
  "catalyst",
  "risk",
  "position",
  "allocation",
  "compounder",
  "drawdown",
  "earnings",
  "guidance",
  "analyst",
  "\u80A1\u7968",
  "\u4E70\u5165",
  "\u5356\u51FA",
  "\u52A0\u4ED3",
  "\u51CF\u4ED3",
  "\u6301\u4ED3",
  "\u7EC4\u5408",
  "\u4F30\u503C",
  "\u589E\u957F",
  "\u5229\u6DA6\u7387",
  "\u62A4\u57CE\u6CB3",
  "\u6295\u8D44\u903B\u8F91",
  "\u50AC\u5316\u5242",
  "\u98CE\u9669",
  "\u4ED3\u4F4D",
  "\u56DE\u64A4",
  "\u8D22\u62A5",
  "\u6307\u5F15",
  "\u7814\u62A5"
];
var decisionSignals = [
  "decide",
  "decides",
  "decided",
  "deciding",
  "decision",
  "decisions",
  "optional",
  "option",
  "options",
  "tradeoff",
  "trade-off",
  "constraint",
  "hypothesis",
  "uncertainty",
  "risk",
  "alternative",
  "why",
  "because",
  "assumption",
  "evidence",
  "benchmark",
  "compare",
  "choose",
  "reject",
  "converge",
  "test",
  "experiment",
  "priority",
  "strategy",
  "should i",
  "pros and cons",
  "criteria",
  "rule",
  "\u9009\u62E9",
  "\u53D6\u820D",
  "\u5047\u8BBE",
  "\u4E0D\u786E\u5B9A\u6027",
  "\u98CE\u9669",
  "\u8BC1\u636E",
  "\u5BF9\u6BD4",
  "\u5224\u65AD",
  "\u65B9\u6848",
  "\u4F18\u5148\u7EA7",
  "\u7B56\u7565",
  "\u6807\u51C6",
  "\u89C4\u5219",
  "\u8981\u4E0D\u8981",
  "\u4E3A\u4EC0\u4E48",
  "\u56E0\u4E3A",
  "\u9A8C\u8BC1",
  "\u5B9E\u9A8C"
];
var epistemicSignals = ["falsify", "disconfirm", "prove wrong", "base rate", "confidence", "uncertain", "unknown", "assume", "evidence", "source", "primary", "variant", "scenario"];
var actionSignals = ["buy", "sell", "add", "trim", "avoid", "watchlist", "act", "log", "decide", "commit", "position", "allocate", "enter", "exit"];
var guardrailQuestions = {
  reverse_expectation_check_before_thematic_growth: [
    "What does the current price already assume?",
    "What revenue, margin, and multiple assumptions must be true?"
  ],
  value_capture_check_before_platform_thesis: [
    "Who captures the value?",
    "What evidence connects the trend to shareholder economics?"
  ],
  falsification_condition_before_position: [
    "What would prove this thesis wrong?",
    "Which evidence should arrive within the stated horizon?"
  ],
  consensus_gap_check_before_contrarian_thesis: [
    "What exactly is consensus?",
    "What exactly do you disagree with?"
  ],
  research_loop_breaker_three_variable_rule: [
    "What are the three variables that determine buy, wait, or reject?",
    "Which research item can change one of those variables?"
  ],
  good_company_bad_stock_check: [
    "How could this be a great company but a poor investment from here?"
  ],
  cycle_regime_guardrail: [
    "Where are we in the relevant cycle?",
    "What variable would change the cycle view?"
  ],
  user_defined_position_protocol: [
    "Is this observation, research-only, initial, confirmed, reject, or review?"
  ],
  matched_master_blind_spot_check: [
    "Which blind spot of the matched master should you avoid copying?"
  ]
};
var DECISION_PATTERN_DIMENSIONS = [
  { id: "philosophy", label: "Philosophy" },
  { id: "decision_making_process", label: "Decision-making process" },
  { id: "research_process", label: "Research process" },
  { id: "buy_sell_discipline", label: "Buy/sell discipline" },
  { id: "risk_process", label: "Risk process" },
  { id: "repeatability", label: "Repeatability" }
];
function expandHome(path) {
  if (path === "~") return homedir();
  if (path.startsWith("~/")) return join(homedir(), path.slice(2));
  return path;
}
function defaultOutput(output) {
  return resolve(expandHome(output ?? "~/.investment-mirror"));
}
function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}
function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}
function writeJson(path, value) {
  ensureDir(dirname(path));
  writeFileSync(path, `${JSON.stringify(value, null, 2)}
`, "utf8");
}
function hashText(text) {
  return createHash("sha256").update(text).digest("hex");
}
var hashFileReadCount = 0;
function hashFile(path) {
  hashFileReadCount++;
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}
function sourceIdFor(path) {
  return `src_${hashText(path).slice(0, 12)}`;
}
function iso(date) {
  return date.toISOString();
}
function todayStamp(date) {
  return date.toISOString().slice(0, 10);
}
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72) || "decision";
}
function detectSourceType(path) {
  const lower = path.toLowerCase();
  const ext = extname(lower);
  if (lower.includes("/.codex/sessions/") && ext === ".jsonl") return "codex_jsonl";
  if (lower.includes("/.claude/projects/") && ext === ".jsonl") return "claude_jsonl";
  if (ext === ".jsonl" || ext === ".json") return "json_transcript";
  if (ext === ".md" || ext === ".markdown") return "markdown_notes";
  if (ext === ".txt" || ext === ".log") return "text_notes";
  if (ext === ".html" || ext === ".htm") return "html_export";
  return null;
}
function walkFiles(rootPath, exclude, limit = 1e4) {
  const files = [];
  const stack = [rootPath];
  const normalizedExclude = exclude.map((item) => resolve(expandHome(item)));
  while (stack.length && files.length < limit) {
    const current = stack.pop();
    if (!existsSync(current)) continue;
    const full = resolve(current);
    if (normalizedExclude.some((excluded) => full === excluded || full.startsWith(`${excluded}/`))) continue;
    const stats = statSync(full);
    if (stats.isDirectory()) {
      for (const entry of readdirSync(full)) {
        if (entry === "node_modules" || entry === ".git" || entry.endsWith(".assets")) continue;
        stack.push(join(full, entry));
      }
    } else if (stats.isFile() && detectSourceType(full)) {
      files.push(full);
    }
  }
  return files.sort();
}
function discoverSources(options = {}) {
  const outputDir = defaultOutput(options.output);
  const previousManifest = readJson(join(outputDir, ".source_manifest.json"), {});
  const selfExcludes = [outputDir, expandHome("~/.investment-mirror"), skillRoot, repoRoot].map((path) => resolve(path));
  const userExcludes = (options.exclude ?? []).map((path) => resolve(expandHome(path)));
  const exclude = [...userExcludes, ...selfExcludes];
  const candidates = [
    join(homedir(), ".codex", "sessions"),
    join(homedir(), ".claude", "projects"),
    ...(options.include ?? []).map(expandHome)
  ];
  const unique = [...new Set(candidates.map((candidate) => resolve(candidate)))];
  const files = [...new Set(unique.flatMap((candidate) => walkFiles(candidate, exclude)))];
  return files.map((path) => {
    const stats = statSync(path);
    const modified_at = stats.mtime.toISOString();
    const prior = previousManifest[path];
    let sha256;
    let status;
    if (options.reindex || !prior) {
      sha256 = hashFile(path);
      status = "new";
    } else if (prior.size_bytes === stats.size && prior.modified_at === modified_at) {
      sha256 = prior.sha256;
      status = "unchanged";
    } else {
      sha256 = hashFile(path);
      status = prior.sha256 !== sha256 ? "changed" : "unchanged";
    }
    return {
      source_id: sourceIdFor(path),
      path,
      path_hash: hashText(path),
      source_type: detectSourceType(path),
      size_bytes: stats.size,
      modified_at,
      sha256,
      status
    };
  });
}
function buildSourceManifest(sources, output) {
  const outputDir = defaultOutput(output);
  ensureDir(outputDir);
  const manifest = Object.fromEntries(sources.map((source) => [source.path, source]));
  writeJson(join(outputDir, ".source_manifest.json"), manifest);
  writeJson(join(outputDir, "source_manifest.json"), {
    generated_at: iso(/* @__PURE__ */ new Date()),
    parser_version: parserVersion,
    scoring_version: scoringVersion,
    sources
  });
  return manifest;
}
function redactSensitive(text) {
  return text.replace(/\bsk-[A-Za-z0-9_-]{16,}\b/g, "[REDACTED_OPENAI_KEY]").replace(/\b(?:ghp|github_pat|glpat|xox[baprs])_[A-Za-z0-9_:-]{12,}\b/g, "[REDACTED_TOKEN]").replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[REDACTED_EMAIL]").replace(/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g, "[REDACTED_AWS_KEY]").replace(/\bbearer\s+[A-Za-z0-9._~+/=-]{16,}/gi, "Bearer [REDACTED]").replace(/\b((?:api|secret|token|password|passwd|pwd)[_\-\s]*[:=]\s*)['"]?[^'"\s]{8,}/gi, "$1[REDACTED]");
}
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}
function countSignals(text, signals) {
  const lower = text.toLowerCase();
  return signals.reduce((count, signal) => count + (matchesSignal(lower, signal) ? 1 : 0), 0);
}
function matchesSignal(lowerText, signal) {
  const lowerSignal = signal.toLowerCase();
  if (/^[a-z0-9_-]+$/.test(lowerSignal)) {
    return new RegExp(`\\b${escapeRegExp(lowerSignal)}\\b`).test(lowerText);
  }
  return lowerText.includes(lowerSignal);
}
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function codeDensity(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return 0;
  const codeLines = lines.filter((line) => /(```|^\s*(const|let|var|function|class|import|export|def|return|\{|\}|\/\/|#include)|;\s*$|=>|Traceback|Exception|Error:)/.test(line));
  return codeLines.length / lines.length;
}
function toolOutputDensity(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return 0;
  const toolLines = lines.filter((line) => /^(Chunk ID:|Wall time:|Exit code:|Output:|\+\+\+|---|@@|npm |yarn |pnpm |git |node_modules\/)/.test(line.trim()));
  return toolLines.length / lines.length;
}
function scoreText(text) {
  const investment = countSignals(text, investmentSignals);
  const decision = countSignals(text, decisionSignals);
  const epistemic = countSignals(text, epistemicSignals);
  const action = countSignals(text, actionSignals);
  const code = codeDensity(text);
  const tool = toolOutputDensity(text);
  const decision_score = 2 * investment + 1.2 * decision + 1 * epistemic + 0.8 * action - 1.5 * code - 1 * tool;
  return {
    decision_score: Number(decision_score.toFixed(3)),
    investment_score: investment,
    reason_codes: [
      investment > 0 ? "investment_terms" : null,
      decision > 0 ? "decision_terms" : null,
      epistemic > 0 ? "epistemic_terms" : null,
      action > 0 ? "action_language" : null,
      code > 0.35 ? "code_density_downweighted" : null,
      tool > 0.25 ? "tool_output_downweighted" : null
    ].filter(Boolean)
  };
}
function extractTextFromUnknown(value) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(extractTextFromUnknown).filter(Boolean).join("\n");
  if (value && typeof value === "object") {
    const object = value;
    const preferred = ["content", "text", "message", "messages", "prompt", "response", "summary", "body"];
    return preferred.filter((key) => key in object).map((key) => extractTextFromUnknown(object[key])).filter(Boolean).join("\n");
  }
  return "";
}
function parseJsonObjectTurn(object, source, index) {
  const role = String(object.role ?? object.type ?? object.kind ?? object.message?.role ?? "unknown");
  const timestamp = object.timestamp ?? object.created_at ?? object.time ?? object.date ?? null;
  const rawText = extractTextFromUnknown(object);
  const text_redacted = redactSensitive(rawText).slice(0, 16e3);
  const scores = scoreText(text_redacted);
  return {
    turn_id: `${source.source_id}_turn_${index}`,
    source_id: source.source_id,
    turn_index: index,
    role,
    timestamp: timestamp ? String(timestamp) : null,
    text_redacted,
    token_estimate: estimateTokens(text_redacted),
    code_density: Number(codeDensity(text_redacted).toFixed(3)),
    decision_score: scores.decision_score,
    investment_score: scores.investment_score
  };
}
function parseSource(source) {
  const raw = readFileSync(source.path, "utf8");
  const ext = extname(source.path).toLowerCase();
  if (ext === ".jsonl") {
    return raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).flatMap((line, index) => {
      try {
        const parsed = JSON.parse(line);
        return [parseJsonObjectTurn(parsed, source, index)];
      } catch {
        const text_redacted = redactSensitive(line);
        const scores = scoreText(text_redacted);
        return [{
          turn_id: `${source.source_id}_turn_${index}`,
          source_id: source.source_id,
          turn_index: index,
          role: "unknown",
          timestamp: null,
          text_redacted,
          token_estimate: estimateTokens(text_redacted),
          code_density: Number(codeDensity(text_redacted).toFixed(3)),
          decision_score: scores.decision_score,
          investment_score: scores.investment_score
        }];
      }
    });
  }
  if (ext === ".json") {
    const parsed = JSON.parse(raw);
    const array = Array.isArray(parsed) ? parsed : [parsed];
    return array.map((item, index) => parseJsonObjectTurn(item && typeof item === "object" ? item : { text: item }, source, index));
  }
  const normalized = source.source_type === "html_export" ? raw.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ") : raw;
  const paragraphs = normalized.split(/\n\s*\n/g).map((paragraph) => paragraph.trim()).filter((paragraph) => paragraph.length > 40);
  return paragraphs.map((paragraph, index) => {
    const text_redacted = redactSensitive(paragraph).slice(0, 12e3);
    const scores = scoreText(text_redacted);
    return {
      turn_id: `${source.source_id}_turn_${index}`,
      source_id: source.source_id,
      turn_index: index,
      role: "note",
      timestamp: null,
      text_redacted,
      token_estimate: estimateTokens(text_redacted),
      code_density: Number(codeDensity(text_redacted).toFixed(3)),
      decision_score: scores.decision_score,
      investment_score: scores.investment_score
    };
  });
}
function buildCandidateSpans(turns) {
  const bySource = groupBy(turns, (turn) => turn.source_id);
  const spans = [];
  for (const [sourceId, sourceTurns] of Object.entries(bySource)) {
    const ordered = sourceTurns.sort((a, b) => a.turn_index - b.turn_index);
    for (const turn of ordered) {
      if (turn.decision_score < 2.2) continue;
      const context = turn.investment_score > 0 ? 2 : 4;
      const start = Math.max(0, turn.turn_index - context);
      const end = Math.min(ordered.length - 1, turn.turn_index + context);
      const spanTurns = ordered.filter((candidate) => candidate.turn_index >= start && candidate.turn_index <= end);
      const joined = spanTurns.map((item) => item.text_redacted).join("\n");
      const scores = scoreText(joined);
      spans.push({
        span_id: `span_${hashText(`${sourceId}:${start}:${end}`).slice(0, 12)}`,
        source_id: sourceId,
        start_turn: start,
        end_turn: end,
        span_type: scores.investment_score > 0 ? "investment" : "general_decision",
        score: scores.decision_score,
        reason_codes: scores.reason_codes,
        analysis_scope: "full_candidate_ledger"
      });
    }
  }
  const deduped = /* @__PURE__ */ new Map();
  for (const span of spans.sort((a, b) => b.score - a.score)) {
    const key = `${span.source_id}:${span.start_turn}:${span.end_turn}`;
    if (!deduped.has(key)) deduped.set(key, span);
  }
  return [...deduped.values()];
}
function collectCandidateEvidenceLedger(spans) {
  return spans.sort((a, b) => b.score - a.score || a.source_id.localeCompare(b.source_id) || a.start_turn - b.start_turn).map((span) => ({ ...span, analysis_scope: "full_candidate_ledger" }));
}
function buildCandidateEvidenceItems(spans, turns, sources) {
  const turnsBySource = groupBy(turns, (turn) => turn.source_id);
  const sourceById = new Map(sources.map((source) => [source.source_id, source]));
  return spans.map((span) => {
    const source = sourceById.get(span.source_id);
    const spanTurns = (turnsBySource[span.source_id] ?? []).filter((turn) => turn.turn_index >= span.start_turn && turn.turn_index <= span.end_turn);
    const text = spanTurns.map((turn) => `[${turn.role}] ${turn.text_redacted}`).join("\n").slice(0, 6e3);
    return {
      evidence_id: `ev_${hashText(span.span_id).slice(0, 12)}`,
      span_id: span.span_id,
      source_id: span.source_id,
      source_alias: source ? sourceAlias(source.path) : span.source_id,
      source_type: source?.source_type ?? "text_notes",
      path_hash: source?.path_hash ?? hashText(span.source_id),
      date: source?.modified_at.slice(0, 10) ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      start_turn: span.start_turn,
      end_turn: span.end_turn,
      turn_ids: spanTurns.map((turn) => turn.turn_id),
      retrieval_score: span.score,
      reason_codes: span.reason_codes,
      matched_signals: matchedRetrievalSignals(text),
      text_redacted: text
    };
  });
}
function matchedRetrievalSignals(text) {
  const groups = [
    ["investment", investmentSignals],
    ["decision", decisionSignals],
    ["epistemic", epistemicSignals],
    ["action", actionSignals]
  ];
  const matched = [];
  for (const [group, signals] of groups) {
    for (const signal of signals) {
      if (matchesSignal(text.toLowerCase(), signal)) matched.push(`${group}:${signal}`);
    }
  }
  return [...new Set(matched)].slice(0, 32);
}
function generateInvestorProfile(options = {}) {
  const now = options.now ?? /* @__PURE__ */ new Date();
  const outputDir = defaultOutput(options.output);
  ensureDir(outputDir);
  ensureDir(join(outputDir, "profile_history"));
  ensureDir(join(outputDir, "decisions"));
  const existingInputs = readJson(join(outputDir, "profile_candidate_inputs.json"), null);
  const sources = discoverSources(options);
  buildSourceManifest(sources, outputDir);
  const priorEvidence = readJson(join(outputDir, "profile_evidence.json"), null);
  if (sources.length === 0) {
    const profile2 = buildNeedsSourcesProfile(now);
    writeJson(join(outputDir, "profile_candidate_inputs.json"), profile2);
    writeProfileState(outputDir, "needs_sources", now, profile2.source_guidance);
    return { profile: profile2, sources, turns: [], spans: [], episodes: [], outputDir };
  }
  const changedSources = filterSourcesForProfileRun(sources, options, now);
  if (!options.reindex && existingInputs && changedSources.length === 0) {
    const preservedProfile = {
      ...existingInputs,
      artifact_kind: "deterministic_profile_inputs",
      profile_state: "interview_required",
      updated_at: iso(now),
      synthesis_mode: "evidence_only_requires_llm",
      llm_required: true,
      provisional: true,
      unknown_dimensions: existingInputs.unknown_dimensions?.length ? existingInputs.unknown_dimensions : defaultUnknownDimensions(),
      candidate_profile_inputs_path: "profile_candidate_inputs.json",
      profile_evidence_path: existingInputs.profile_evidence_path ?? "profile_evidence.json",
      profile_synthesis_prompt_path: existingInputs.profile_synthesis_prompt_path ?? "profile_synthesis_prompt.md",
      profile_finalization_schema_path: existingInputs.profile_finalization_schema_path ?? "profile_finalization_schema.json",
      profile_report_template_path: existingInputs.profile_report_template_path ?? "profile_report_template.html",
      candidate_report_html_path: existingInputs.candidate_report_html_path ?? "profile_candidate_report.html",
      final_rendered_html_path: existingInputs.final_rendered_html_path ?? existingInputs.final_model_html_path ?? "profile.html",
      source_summary: {
        ...existingInputs.source_summary,
        conversations_scanned: sources.length
      }
    };
    if (!existsSync(join(outputDir, "profile_evidence.json")) || !existsSync(join(outputDir, "profile_synthesis_prompt.md")) || !existsSync(join(outputDir, "profile_report_template.html")) || !existsSync(join(outputDir, "profile_finalization_schema.json"))) {
      writeProfileSynthesisArtifacts(outputDir, preservedProfile, priorEvidence?.candidate_evidence_items ?? [], now);
    }
    writeCandidateProfileArtifacts(outputDir, preservedProfile, priorEvidence?.candidate_evidence_items ?? [], now, "profile");
    return { profile: preservedProfile, sources, turns: [], spans: [], episodes: [], outputDir };
  }
  const turns = changedSources.flatMap(parseSource);
  const spans = buildCandidateSpans(turns);
  const candidateLedger = collectCandidateEvidenceLedger(spans);
  const currentEvidenceItems = buildCandidateEvidenceItems(candidateLedger, turns, changedSources);
  if (changedSources.length) writeSqliteIndex(outputDir, sources, turns, candidateLedger, []);
  const mergedEvidenceItems = mergeCandidateEvidenceItems(priorEvidence?.candidate_evidence_items ?? [], currentEvidenceItems);
  const profile = buildEvidenceWorkspaceProfile(mergedEvidenceItems, sources.length, turns.length, now);
  writeProfileSynthesisArtifacts(outputDir, profile, mergedEvidenceItems, now);
  writeCandidateProfileArtifacts(outputDir, profile, mergedEvidenceItems, now, "profile");
  return { profile, sources, turns, spans: candidateLedger, episodes: [], outputDir };
}
function filterSourcesForProfileRun(sources, options, now) {
  if (options.reindex) return sources;
  const cutoff = options.since ? sinceToDate(options.since, now) : null;
  if (cutoff) {
    return sources.filter((source) => new Date(source.modified_at).getTime() >= cutoff.getTime());
  }
  return sources.filter((source) => source.status !== "unchanged");
}
function sinceToDate(since, now) {
  const trimmed = since.trim().toLowerCase();
  const relative2 = trimmed.match(/^(\d+)\s*(d|day|days|w|week|weeks|m|mo|month|months)$/);
  if (relative2) {
    const amount = Number(relative2[1]);
    const unit = relative2[2];
    const days = unit.startsWith("w") ? amount * 7 : unit.startsWith("m") ? amount * 31 : amount;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1e3);
  }
  const parsed = new Date(since);
  if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid --since value: ${since}`);
  return parsed;
}
function mergeCandidateEvidenceItems(prior, current) {
  const merged = /* @__PURE__ */ new Map();
  for (const item of prior) merged.set(item.evidence_id, item);
  for (const item of current) merged.set(item.evidence_id, item);
  return [...merged.values()].sort((a, b) => b.retrieval_score - a.retrieval_score || b.date.localeCompare(a.date));
}
function defaultUnknownDimensions() {
  return [
    "risk_preference_loss_tolerance",
    "time_horizon",
    "liquidity_or_personal_constraints",
    "concentration_comfort",
    "what_counts_as_enough_evidence"
  ];
}
function writeProfileState(outputDir, state, now, reason) {
  const previous = readJson(join(outputDir, "profile_state.json"), null);
  const priorState = previous?.state ?? null;
  const transitions = previous?.transitions ?? [];
  transitions.push({ from: priorState, to: state, at: iso(now), reason });
  const artifact = {
    version: "0.2",
    state,
    generated_at: iso(now),
    candidate_profile_inputs_path: "profile_candidate_inputs.json",
    final_profile_path: "profile.json",
    final_html_path: "profile.html",
    required_next_action: state === "needs_sources" ? "0 sources discovered. Add --include paths or confirm ~/.codex/sessions / ~/.claude/projects contain transcripts, then re-run /investment-profile-init." : state === "interview_required" ? "Agent/LLM must read profile_evidence.json, perform full evidence analysis, ask 2-5 targeted interview questions, synthesize profile JSON, generate structured final profile content, then run profile-finalize." : "Profile finalization state recorded.",
    transitions,
    finalization_contract: {
      command: 'node scripts/cli.mjs profile-finalize --synthesis synthesized_profile.json --questions interview_questions.json --answers-summary "..." --content profile_model_content.json --output ~/.investment-mirror',
      requires_agent_questions: true,
      requires_answer_summary_or_explicit_decline: true,
      requires_llm_synthesized_profile_json: true,
      requires_model_generated_profile_content: true,
      requires_deterministic_profile_html_render: true,
      provisional_allowed_when_user_declines_interview: true
    }
  };
  writeJson(join(outputDir, "profile_state.json"), artifact);
}
function buildNeedsSourcesProfile(now) {
  const guidance = "0 sources discovered. Add --include paths to your notes/transcripts, or confirm that ~/.codex/sessions or ~/.claude/projects contain transcript files, then re-run /investment-profile-init.";
  return {
    profile_id: `profile_${todayStamp(now).replaceAll("-", "_")}`,
    artifact_kind: "deterministic_profile_inputs",
    profile_state: "needs_sources",
    created_at: iso(now),
    updated_at: iso(now),
    synthesis_mode: "evidence_only_requires_llm",
    llm_required: true,
    provisional: true,
    needs_sources: true,
    source_guidance: guidance,
    unknown_dimensions: defaultUnknownDimensions(),
    candidate_profile_inputs_path: "profile_candidate_inputs.json",
    confidence: 0,
    primary_patterns: [],
    best_fit_master_matches: [],
    match_strengths: [],
    recommended_guardrails: [],
    decision_fingerprint: {},
    default_issue: "No local sources were discovered, so no decision patterns could be derived yet.",
    active_guardrails: [],
    source_summary: {
      conversations_scanned: 0,
      decision_episodes_found: 0,
      receipts_used: 0,
      tier1_investment_episodes: 0,
      tier2_investment_episodes: 0,
      tier3_general_decision_episodes: 0,
      calibration_recommended: false
    },
    receipts: [],
    presentation_next_steps: [
      guidance,
      "Re-run /investment-profile-init once at least one source is available."
    ]
  };
}
function buildEvidenceWorkspaceProfile(evidenceItems, sourceCount, turnCount, now) {
  return {
    profile_id: `profile_${todayStamp(now).replaceAll("-", "_")}`,
    artifact_kind: "deterministic_profile_inputs",
    profile_state: "interview_required",
    created_at: iso(now),
    updated_at: iso(now),
    synthesis_mode: "evidence_only_requires_llm",
    llm_required: true,
    provisional: true,
    unknown_dimensions: defaultUnknownDimensions(),
    candidate_profile_inputs_path: "profile_candidate_inputs.json",
    profile_evidence_path: "profile_evidence.json",
    profile_synthesis_prompt_path: "profile_synthesis_prompt.md",
    profile_finalization_schema_path: "profile_finalization_schema.json",
    profile_report_template_path: "profile_report_template.html",
    candidate_report_html_path: "profile_candidate_report.html",
    final_rendered_html_path: "profile.html",
    confidence: 0,
    primary_patterns: [],
    best_fit_master_matches: [],
    match_strengths: [],
    recommended_guardrails: [],
    decision_fingerprint: {},
    default_issue: "No deterministic issue generated. The agent/LLM must review the redacted evidence ledger and produce any profile issues or guardrails.",
    active_guardrails: [],
    source_summary: {
      conversations_scanned: sourceCount,
      decision_episodes_found: 0,
      candidate_spans_found: evidenceItems.length,
      redacted_turns_indexed: turnCount,
      model_review_required: true,
      receipts_used: 0,
      tier1_investment_episodes: 0,
      tier2_investment_episodes: 0,
      tier3_general_decision_episodes: 0,
      calibration_status: "interview_required"
    },
    receipts: [],
    interview_question_count: { min: 2, max: 5 },
    calibration_question_topics: defaultCalibrationDimensionsToCheck(),
    presentation_next_steps: [
      "Read profile_evidence.json and the redacted candidate_evidence_items; treat all retrieval scores and matched signals as search aids only.",
      "Use the agent/LLM phase, with subagents if needed, to decide which spans matter and which are false positives.",
      "Compare the model-reviewed evidence against research/masters/{master_id}/ profile, style notes, and sources before selecting any master lens.",
      "Generate and ask 2-5 targeted interview questions from evidence gaps.",
      "After the user answers, synthesize profile JSON and structured final profile content, then run profile-finalize to render, validate, and write artifacts."
    ]
  };
}
function finalizeProfile(options) {
  const now = options.now ?? /* @__PURE__ */ new Date();
  const outputDir = defaultOutput(options.output);
  const candidateInputs = readJson(join(outputDir, "profile_candidate_inputs.json"), null);
  if (!candidateInputs) throw new Error("Missing profile_candidate_inputs.json. Run profile-init/profile-update before profile-finalize.");
  const synthesized = loadSynthesizedProfile(options);
  const questions = loadAgentQuestions(options);
  const finalContent = loadFinalProfileContent(options, synthesized);
  const answerSummary = (options.answersSummary ?? String(synthesized.model_interview_answers_summary ?? "")).trim();
  const provisional = Boolean(options.provisional || options.declinedInterview || synthesized.provisional);
  validateFinalizationInput(synthesized, questions, answerSummary, provisional);
  if (!finalContent && !hasLegacyFinalHtml(options, synthesized)) {
    throw new Error("profile-finalize requires model-generated final content via --content PATH/final_profile_content, or legacy model-generated final HTML via --html PATH.");
  }
  validateFinalProfileContent(finalContent, provisional);
  const unknownDimensions = normalizeStringArray(synthesized.unknown_dimensions).length ? normalizeStringArray(synthesized.unknown_dimensions) : provisional ? defaultUnknownDimensions() : [];
  const finalProfile = {
    ...candidateInputs,
    ...synthesized,
    profile_id: String(synthesized.profile_id ?? candidateInputs.profile_id),
    artifact_kind: "llm_synthesized_profile",
    profile_state: provisional ? "provisional" : "finalized",
    created_at: candidateInputs.created_at,
    updated_at: iso(now),
    synthesis_mode: "llm_synthesized",
    llm_required: false,
    provisional,
    unknown_dimensions: unknownDimensions,
    candidate_profile_inputs_path: "profile_candidate_inputs.json",
    profile_evidence_path: "profile_evidence.json",
    profile_synthesis_prompt_path: "profile_synthesis_prompt.md",
    profile_finalization_schema_path: "profile_finalization_schema.json",
    profile_report_template_path: "profile_report_template.html",
    candidate_report_html_path: "profile_candidate_report.html",
    final_rendered_html_path: "profile.html",
    confidence: normalizeFinalConfidence(synthesized.confidence ?? candidateInputs.confidence, provisional, unknownDimensions),
    agent_interview_questions: questions,
    model_interview_questions: questions,
    model_interview_answers_summary: answerSummary || (provisional ? "User declined or did not complete interview calibration." : ""),
    evidence_summary: String(synthesized.evidence_summary ?? candidateInputs.evidence_summary ?? evidenceSummaryFromInputs(candidateInputs)),
    interpretation_summary: String(synthesized.interpretation_summary ?? candidateInputs.interpretation_summary ?? "LLM synthesis completed from local evidence receipts and interview calibration."),
    false_match_warning: String(synthesized.false_match_warning ?? "The master match is a learning archetype, not an identity claim or authority signal."),
    source_summary: finalSourceSummary(synthesized.source_summary, candidateInputs.source_summary, provisional),
    best_fit_master_matches: normalizeFinalMatches(synthesized.best_fit_master_matches, candidateInputs.best_fit_master_matches)
  };
  delete finalProfile.final_profile_html;
  delete finalProfile.final_profile_html_path;
  delete finalProfile.final_profile_content;
  delete finalProfile.final_profile_content_path;
  delete finalProfile.final_model_html_path;
  validateProfileSafety(finalProfile);
  const finalHtml = finalContent ? renderFinalProfileHtml(finalProfile, finalContent, outputDir) : loadLegacyFinalProfileHtml(options, synthesized);
  validateFinalProfileHtml(finalHtml, provisional);
  writeJson(join(outputDir, "profile.json"), finalProfile);
  writeJson(join(outputDir, "profile_history", `${todayStamp(now)}-${finalProfile.profile_state}-profile.json`), finalProfile);
  writeFileSync(join(outputDir, "profile.html"), finalHtml, "utf8");
  writeFileSync(join(outputDir, "profile_history", `${todayStamp(now)}-${finalProfile.profile_state}-profile.html`), finalHtml, "utf8");
  writeProfileState(outputDir, finalProfile.profile_state, now, provisional ? "Profile artifact validated and written as provisional after explicit interview decline or incomplete calibration." : "LLM-synthesized profile artifact validated and written after interview calibration.");
  return { profile: finalProfile, outputDir };
}
function loadSynthesizedProfile(options) {
  if (options.synthesizedProfile) return options.synthesizedProfile;
  if (!options.synthesizedProfilePath) throw new Error("profile-finalize requires --synthesis PATH or an in-memory synthesizedProfile.");
  return readJson(expandHome(options.synthesizedProfilePath), {});
}
function loadFinalProfileContent(options, synthesized) {
  if (options.finalContent) return options.finalContent;
  const contentPath = options.finalContentPath ?? (typeof synthesized.final_profile_content_path === "string" ? synthesized.final_profile_content_path : void 0);
  if (contentPath) return readJson(expandHome(contentPath), {});
  if (synthesized.final_profile_content && typeof synthesized.final_profile_content === "object") return synthesized.final_profile_content;
  return null;
}
function hasLegacyFinalHtml(options, synthesized) {
  return Boolean(options.finalHtml || options.finalHtmlPath || typeof synthesized.final_profile_html_path === "string" || typeof synthesized.final_profile_html === "string");
}
function loadLegacyFinalProfileHtml(options, synthesized) {
  if (options.finalHtml) return options.finalHtml;
  const htmlPath = options.finalHtmlPath ?? (typeof synthesized.final_profile_html_path === "string" ? synthesized.final_profile_html_path : void 0);
  if (htmlPath) return readFileSync(expandHome(htmlPath), "utf8");
  if (typeof synthesized.final_profile_html === "string") return synthesized.final_profile_html;
  throw new Error("profile-finalize requires model-generated final content via --content PATH/final_profile_content, or legacy model-generated final HTML via --html PATH.");
}
function loadAgentQuestions(options) {
  if (options.agentQuestions) return normalizeStringArray(options.agentQuestions);
  if (!options.questionsPath) return [];
  const parsed = readJson(expandHome(options.questionsPath), []);
  if (Array.isArray(parsed)) return normalizeStringArray(parsed);
  if (parsed && typeof parsed === "object") {
    const object = parsed;
    return normalizeStringArray(object.questions ?? object.agent_interview_questions ?? object.model_interview_questions);
  }
  return [];
}
function validateFinalizationInput(synthesized, questions, answerSummary, provisional) {
  if (questions.length < 2 || questions.length > 5) throw new Error("profile-finalize requires 2-5 agent-generated interview questions.");
  if (!provisional && answerSummary.length < 20) throw new Error("profile-finalize requires a substantive interview answer summary unless --provisional/--declined-interview is set.");
  const unknownDimensions = normalizeStringArray(synthesized.unknown_dimensions);
  if (provisional && unknownDimensions.length === 0) throw new Error("Provisional finalization requires explicit unknown_dimensions.");
  if (!Array.isArray(synthesized.best_fit_master_matches) || synthesized.best_fit_master_matches.length === 0) {
    throw new Error("profile-finalize requires model-selected best_fit_master_matches; deterministic candidate matches cannot be promoted automatically.");
  }
  if (!Array.isArray(synthesized.primary_patterns) || synthesized.primary_patterns.length === 0) {
    throw new Error("profile-finalize requires model-synthesized primary_patterns.");
  }
  if (!Array.isArray(synthesized.active_guardrails) || synthesized.active_guardrails.length === 0) {
    throw new Error("profile-finalize requires model-selected active_guardrails.");
  }
  if (!synthesized.decision_fingerprint || typeof synthesized.decision_fingerprint !== "object" || Object.keys(synthesized.decision_fingerprint).length === 0) {
    throw new Error("profile-finalize requires a model-synthesized decision_fingerprint.");
  }
  for (const match of synthesized.best_fit_master_matches) {
    if (!match || typeof match !== "object" || !("match_confidence" in match)) {
      throw new Error("Each model-selected master match must include qualitative match_confidence.");
    }
    const confidence = match.match_confidence;
    if (confidence !== "low" && confidence !== "medium" && confidence !== "high") {
      throw new Error("Each model-selected master match must use match_confidence low, medium, or high.");
    }
  }
  for (const field of ["evidence_summary", "interpretation_summary", "risk_preference_summary", "time_horizon_summary", "constraints_summary", "false_match_warning"]) {
    if (!provisional && String(synthesized[field] ?? "").trim().length < 12) throw new Error(`profile-finalize missing synthesized field: ${field}`);
  }
}
function validateFinalProfileContent(content, provisional) {
  if (!content) return;
  const requiredStrings = [
    ["hero.user_decision_style", content.hero?.user_decision_style ?? content.hero?.positive_recognition],
    ["hero.why_master_match", content.hero?.why_master_match ?? content.master_lens?.why_this_lens],
    ["evidence.summary", content.evidence?.summary],
    ["decision_pattern.summary", content.decision_pattern?.summary ?? content.interpretation?.summary],
    ["master_lens.why_this_lens", content.master_lens?.why_this_lens],
    ["interview_calibration.answers_summary", content.interview_calibration?.answers_summary],
    ["decision_review_cta.command_template", content.decision_review_cta?.command_template ?? content.next_process_step]
  ];
  for (const [field, value] of requiredStrings) {
    if (!provisional && String(value ?? "").trim().length < 12) {
      throw new Error(`profile-finalize missing model-generated final content field: ${field}`);
    }
  }
  if (!provisional && (!Array.isArray(content.evidence?.rows) || content.evidence.rows.length < 2)) {
    throw new Error("profile-finalize requires model-generated evidence.rows for the structured evidence contract.");
  }
  const dimensions = content.decision_pattern?.dimensions ?? [];
  if (!provisional) {
    const present = new Set(dimensions.map((dimension) => dimension.id).filter(Boolean));
    const missing = DECISION_PATTERN_DIMENSIONS.map((dimension) => dimension.id).filter((id) => !present.has(id));
    if (missing.length) {
      throw new Error(`profile-finalize missing decision_pattern dimensions: ${missing.join(", ")}`);
    }
  }
  if (!Array.isArray(content.guardrail_protocols) || content.guardrail_protocols.length === 0) {
    throw new Error("profile-finalize requires model-generated guardrail_protocols in final content.");
  }
  if (content.guardrail_protocols.length > 5) {
    throw new Error("profile-finalize guardrail_protocols must stay concise: provide 1-5 model-generated protocols.");
  }
}
function validateFinalProfileHtml(html, provisional) {
  const required = [
    /<html[\s>]/i,
    /Investment Mirror/i,
    /evidence|证据/i,
    /decision pattern|six-dimension|六维|决策画像|interpretation|model/i,
    /master|能学到什么|what to learn from|learning lens/i,
    /guardrail|protocol/i,
    /\/investment-decision/i,
    /does not provide investment|not provide investment/i
  ];
  const missing = required.find((pattern) => !pattern.test(html));
  if (missing) throw new Error(`Model-generated profile HTML is missing required report content: ${missing}`);
  if (!provisional && /provisional/i.test(html.slice(0, 5e3))) {
    throw new Error("Finalized profile HTML appears to label itself provisional.");
  }
  const forbidden = [
    /<script[\s>]/i,
    /<iframe[\s>]/i,
    /\son(?:load|error|click|mouseover)\s*=/i,
    /\{\{[^}]+\}\}/,
    /\bwe recommend\b/i,
    /\byou should (buy|sell|hold|allocate|size)\b/i,
    /\b(strong buy|strong sell)\b/i,
    /\bposition size should\b/i,
    /\bsuitable for you\b/i
  ];
  const matched = forbidden.find((pattern) => pattern.test(html));
  if (matched) throw new Error(`Model-generated profile HTML contains forbidden or unsafe content: ${matched}`);
}
function validateProfileSafety(profile) {
  const serialized = JSON.stringify(profile);
  const forbidden = [
    /\bwe recommend\b/i,
    /\byou should (buy|sell|hold|allocate|size)\b/i,
    /\b(strong buy|strong sell)\b/i,
    /\bposition size should\b/i,
    /\bsuitable for you\b/i
  ];
  const matched = forbidden.find((pattern) => pattern.test(serialized));
  if (matched) throw new Error(`Final profile contains forbidden recommendation/suitability language: ${matched}`);
  if (profile.best_fit_master_matches.length < 1 || profile.best_fit_master_matches.length > 2) {
    throw new Error("Final profile must contain one primary master match and at most one secondary affinity.");
  }
  if (profile.synthesis_mode === "llm_synthesized") {
    const scoredFinalMatch = profile.best_fit_master_matches.find((match) => "similarity" in match || "candidate_similarity" in match);
    if (scoredFinalMatch) throw new Error("Final profile master matches must not expose deterministic similarity scores.");
    if ("calibration_recommended" in profile.source_summary) throw new Error("Final profile source_summary must not expose deterministic calibration_recommended.");
  }
}
function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}
function normalizeFinalConfidence(value, provisional, unknownDimensions) {
  const parsed = typeof value === "number" && Number.isFinite(value) ? value : Number(value);
  const raw = Number.isFinite(parsed) ? parsed : 0.58;
  const ceiling = provisional || unknownDimensions.length ? 0.7 : 0.9;
  return Number(Math.max(0.2, Math.min(ceiling, raw)).toFixed(2));
}
function finalSourceSummary(value, fallback, provisional) {
  const object = value && typeof value === "object" ? value : {};
  return {
    conversations_scanned: Number(object.conversations_scanned ?? fallback.conversations_scanned ?? 0),
    decision_episodes_found: Number(object.decision_episodes_found ?? fallback.decision_episodes_found ?? 0),
    receipts_used: Number(object.receipts_used ?? fallback.receipts_used ?? 0),
    tier1_investment_episodes: Number(object.tier1_investment_episodes ?? fallback.tier1_investment_episodes ?? 0),
    tier2_investment_episodes: Number(object.tier2_investment_episodes ?? fallback.tier2_investment_episodes ?? 0),
    tier3_general_decision_episodes: Number(object.tier3_general_decision_episodes ?? fallback.tier3_general_decision_episodes ?? 0),
    calibration_status: provisional ? "partial" : "complete"
  };
}
function matchScore(match) {
  if (!match) return null;
  if (typeof match.candidate_similarity === "number") return match.candidate_similarity;
  if (typeof match.similarity === "number") return match.similarity;
  return null;
}
function normalizeFinalMatches(value, candidateMatches) {
  if (!Array.isArray(value) || value.length === 0) throw new Error("Final profile requires model-selected best_fit_master_matches.");
  return value.slice(0, 2).map((item, index) => {
    if (!item || typeof item !== "object") throw new Error("Each final master match must be an object.");
    const object = item;
    const masterId = String(object.master_id ?? "").trim();
    if (!masterId) throw new Error("Each final master match must include master_id.");
    const candidate = candidateMatches.find((match) => match.master_id === masterId);
    const master = MASTER_RECORDS.find((record) => record.id === masterId);
    if (!candidate && !master) throw new Error(`Unknown final master_id: ${masterId}`);
    const base = master ? masterRecordToMatch(master, index + 1) : candidate;
    const matchConfidence = normalizeMatchConfidence(object.match_confidence, candidate);
    return {
      rank: index + 1,
      master_id: masterId,
      display_name: String(object.display_name ?? base.display_name),
      why_match: String(object.why_match ?? base.why_match),
      bio_summary: String(object.bio_summary ?? base.bio_summary),
      investment_style: String(object.investment_style ?? base.investment_style),
      notable_results_summary: String(object.notable_results_summary ?? base.notable_results_summary),
      read_more_url: String(object.read_more_url ?? base.read_more_url),
      what_to_learn: normalizeOptionalStringArray(object.what_to_learn, base.what_to_learn),
      what_not_to_copy: normalizeOptionalStringArray(object.what_not_to_copy, base.what_not_to_copy),
      asset_path: String(object.asset_path ?? base.asset_path),
      match_confidence: matchConfidence,
      selection_basis: String(object.selection_basis ?? "model_selected_from_evidence_interview_and_master_records")
    };
  });
}
function masterRecordToMatch(master, rank) {
  return {
    rank,
    master_id: master.id,
    display_name: master.displayName,
    why_match: `Model-selected learning archetype. Treat ${master.displayName} as a process lens, not an authority signal.`,
    bio_summary: master.bioSummary,
    investment_style: master.investmentStyle,
    notable_results_summary: master.notableResultsSummary,
    read_more_url: master.readMoreUrl,
    what_to_learn: master.whatToLearn,
    what_not_to_copy: master.whatNotToCopy,
    asset_path: `profile.assets/masters/${master.id}.svg`
  };
}
function normalizeMatchConfidence(value, candidate) {
  if (value === "low" || value === "medium" || value === "high") return value;
  const score = matchScore(candidate);
  if (score === null) return "medium";
  if (score >= 0.78) return "high";
  if (score >= 0.6) return "medium";
  return "low";
}
function normalizeOptionalStringArray(value, fallback) {
  const normalized = normalizeStringArray(value);
  return normalized.length ? normalized : fallback;
}
function evidenceSummaryFromInputs(profile) {
  const spans = profile.source_summary.candidate_spans_found ?? profile.source_summary.decision_episodes_found;
  return `${spans} redacted candidate evidence spans across ${profile.source_summary.conversations_scanned} local sources were prepared for model review; deterministic tooling made no profile judgment.`;
}
function masterRecordsToCompare() {
  return MASTER_RECORDS.map((master) => ({
    master_id: master.id,
    display_name: master.displayName,
    profile_path: `research/masters/${master.id}/profile.md`,
    style_notes_path: `research/masters/${master.id}/style_notes.md`,
    sources_path: `research/masters/${master.id}/sources.yaml`
  }));
}
function buildProfileEvidencePacket(profile, evidenceItems, now) {
  return {
    version: "0.2",
    generated_at: iso(now),
    instructions: "This packet is deterministic evidence retrieval only. It contains redacted candidate evidence spans and source metadata. The agent/LLM must decide which spans matter, classify patterns, compare evidence against master records, select any master lens, form guardrails, and synthesize the final profile. Retrieval scores and matched signals are search aids only.",
    artifact_kind: "deterministic_evidence_packet",
    analysis_scope: "full_candidate_ledger",
    source_summary: profile.source_summary,
    deterministic_retrieval_inputs: {
      candidate_spans_found: evidenceItems.length,
      redacted_turns_indexed: profile.source_summary.redacted_turns_indexed ?? 0,
      scoring_version: scoringVersion,
      note: "Scores and matched signals are retrieval/ranking aids, not content judgments, episodes, patterns, guardrails, or master matches."
    },
    candidate_evidence_items: evidenceItems,
    master_records_to_compare: masterRecordsToCompare(),
    calibration_dimensions_to_check: profile.calibration_question_topics ?? defaultCalibrationDimensionsToCheck(),
    interview_question_contract: {
      required: true,
      count_min: 2,
      count_max: 5,
      generated_by: "agent_llm_after_reading_evidence",
      must_include_when_unobserved: [
        "risk preference / loss tolerance",
        "investment horizon",
        "liquidity or capital constraints",
        "concentration comfort",
        "decision authority and what counts as enough evidence"
      ]
    },
    llm_output_contract: {
      must_produce: [
        "positive recognition first",
        "one primary best-fit master match and at most one secondary affinity",
        "evidence-backed explanation distinguishing evidence from interpretation",
        "guardrails that make the style investable",
        "2-5 agent-generated interview questions before finalization",
        "model-generated structured final profile content after user answers, using profile_report_template.html as visual reference only",
        "false-match warning",
        "next steps after presenting the result"
      ],
      must_not_produce: [
        "buy/sell/hold recommendations",
        "position sizing",
        "unsupported annualized return claims",
        "raw transcript quotes by default",
        "identity claims like 'you are Warren Buffett'"
      ],
      tone: "60% positive recognition, 40% guardrail discipline; no shame, no astrology, no authority worship."
    },
    model_phase_contract: {
      phases: [
        {
          id: "phase_2_full_evidence_analysis",
          owner: "agent_llm",
          required_output: "Model-reviewed episode interpretations from the full candidate ledger; use subagents when the ledger is too large for one pass."
        },
        {
          id: "phase_3_interview_question_formation",
          owner: "agent_llm",
          required_output: "2-5 targeted interview questions created from evidence gaps, not a fixed questionnaire."
        },
        {
          id: "phase_4_master_and_profile_synthesis",
          owner: "agent_llm",
          required_output: "Final master match, profile JSON, and structured final profile content produced by reading evidence plus master records."
        },
        {
          id: "phase_5_artifact_validation_write",
          owner: "deterministic_tool",
          required_output: "Schema/safety validation and artifact write only; no profile judgment."
        }
      ],
      subagent_recommended_for_full_ledger: true,
      final_master_match_owner: "agent_llm",
      final_profile_content_owner: "agent_llm",
      final_profile_html_owner: "deterministic_renderer"
    }
  };
}
function writeProfileSynthesisArtifacts(outputDir, profile, evidenceItems, now) {
  const packet = buildProfileEvidencePacket(profile, evidenceItems, now);
  writeJson(join(outputDir, "profile_evidence.json"), packet);
  writeFileSync(join(outputDir, "profile_synthesis_prompt.md"), renderProfileSynthesisPrompt(packet), "utf8");
  writeJson(join(outputDir, "profile_finalization_schema.json"), profileFinalizationSchema());
  writeFileSync(join(outputDir, "profile_report_template.html"), renderProfileReportTemplate(profile, outputDir), "utf8");
}
function renderProfileSynthesisPrompt(packet) {
  return `# Investment Mirror LLM Profile Synthesis Prompt

You are running the model-owned phases of an Investment Mirror profile from a deterministic local evidence packet. The local program discovered sources, redacted sensitive text, ranked candidate spans for retrieval, and wrote local indexes. It did not classify episodes, count user patterns, choose guardrails, choose a master lens, or write a profile judgment. Your job is to read the redacted evidence and synthesize the actual user-facing profile using model judgment.

## Inputs To Read

- \`profile_evidence.json\`
- \`source_manifest.json\`
- \`profile_candidate_inputs.json\` as retrieval/workspace state only
- \`profile_finalization_schema.json\`
- \`profile_report_template.html\` as a visual/reference specimen, not a fill-in template
- every relevant \`research/masters/{master_id}/profile.md\`, \`style_notes.md\`, and \`sources.yaml\` file before choosing the final master lens

## Phase 2: Full Evidence Analysis

1. Read the full \`candidate_evidence_items\` ledger. Retrieval score only orders what to inspect first; it is not a confidence score.
2. If the ledger is too large for one pass, use subagents to review disjoint source/date groups and return episode interpretations.
3. Decide which candidate spans actually matter, which should be ignored, and which evidence tiers are strong enough for profile synthesis.
4. Create any pattern labels yourself from the evidence. Do not assume the deterministic tool has identified patterns.

## Phase 3: Interview Question Formation

1. Generate 2-5 interview questions from evidence gaps.
2. These are not from a limited fixed set. They are model-created questions grounded in observed evidence and unknown dimensions.
3. Ask the user before final profile synthesis unless they explicitly decline calibration.

## Phase 4: Master Match, Profile Synthesis, And Final Content

1. Start with positive recognition of the strongest evidenced decision behavior.
2. Choose the primary best-fit master match by comparing model-reviewed evidence against master records. There are no deterministic candidate master suggestions in this packet.
3. State why the match is useful and what not to copy. Do not use or invent deterministic similarity scores.
4. Distinguish evidence from interpretation.
5. Write the user-facing decision pattern through six investment-process dimensions: philosophy, decision-making process, research process, buy/sell discipline, risk process, and repeatability. These are profile dimensions about how the user makes investment decisions, not a checklist for one security.
6. After the user answers, produce a model-synthesized JSON object matching \`profile_finalization_schema.json\`.
7. Produce \`profile_model_content.json\`: structured user-facing final content for hero recognition, evidence scanned, the six-dimension decision pattern, master learning lens, compact guardrail protocol, and a \`/investment-decision\` command scaffold.
8. Run \`profile-finalize --synthesis synthesized_profile.json --questions interview_questions.json --answers-summary "..." --content profile_model_content.json\` so the deterministic renderer can produce the final static \`profile.html\`.
9. Suggest the next step: usually run \`/investment-decision\` on a current thesis.

## User-Facing Content Rules

1. Match the completed interview answers' dominant language for interview questions, final profile copy, completion summaries, and rendered HTML chrome unless the user asks for another language. If interview-answer language conflicts with earlier chat or transcript language, the interview-answer language wins. Master names, file paths, IDs, and technical field names may stay in their canonical form.
2. Calibrate confidence and wording to evidence strength. If direct public-equity evidence is absent or sparse, say the profile is evidence-light or process-level, keep the master lens tentative/low-confidence unless interview answers strongly support it, and avoid definitive identity-style claims.
3. Keep direct investment evidence, indirect process evidence, and interview calibration separate. Do not let product/engineering workflow evidence masquerade as investment behavior.
4. A user-stated drawdown or thesis-deterioration threshold is a review boundary, not proof of broad risk tolerance, allocation comfort, sizing preference, or suitability.
5. If constraints were not stated, write "no constraints were stated" rather than "the user has no constraints."
6. Avoid pseudo-precision. Numeric decision-fingerprint values are model orientation signals, not measurements; when evidence is thin, use qualitative bands or explicitly flag uncertainty in the copy.
7. Do not split interview calibration into its own standalone user-facing section. Keep it as one row in the structured evidence contract unless the report is provisional and needs unknown dimensions; the rendered HTML should stay compact with evidence-boundary metrics and dimension-level evidence signals.
8. The profile call-to-action must connect to the skill-family \`/investment-decision\` workflow, not a generic chat prompt. The command scaffold should ask the user to fill ticker/theme, horizon, thesis, price expectation, catalyst, falsification/deterioration condition, and constraints/review boundaries.

## Evidence Packet Summary

\`\`\`json
${JSON.stringify({
    source_summary: packet.source_summary,
    deterministic_retrieval_inputs: packet.deterministic_retrieval_inputs,
    candidate_evidence_count: packet.candidate_evidence_items.length,
    first_candidate_evidence_items: packet.candidate_evidence_items.slice(0, 8).map((item) => ({
      evidence_id: item.evidence_id,
      source_alias: item.source_alias,
      source_type: item.source_type,
      date: item.date,
      retrieval_score: item.retrieval_score,
      matched_signals: item.matched_signals.slice(0, 12),
      text_redacted_preview: item.text_redacted.slice(0, 700)
    })),
    master_records_to_compare: packet.master_records_to_compare,
    calibration_dimensions_to_check: packet.calibration_dimensions_to_check,
    interview_question_contract: packet.interview_question_contract,
    model_phase_contract: packet.model_phase_contract
  }, null, 2)}
\`\`\`

## Hard Boundaries

- Do not recommend buying, selling, holding, allocating, or sizing.
- Do not expose raw transcripts unless explicitly requested.
- Do not claim the user is a master investor.
- Do not rank masters by performance.
- Do not treat retrieval scores or matched signals as conclusions.
- Do not put deterministic similarity in \`best_fit_master_matches\`; final matches use model judgment and qualitative confidence.
- Do not ask the model to hand-write final \`profile.html\`; the model phase must produce structured final profile content, and the finalizer renders HTML.
- Do not finalize \`profile.json\` or \`profile.html\` until you have asked 2-5 targeted interview questions and incorporated the user's answers, unless the user explicitly declines calibration; in that case mark the report provisional and list unknown dimensions.
- Do not present process-only evidence as direct investing history.
- Do not state or imply that absent constraints equal no constraints.
`;
}
function profileFinalizationSchema() {
  return {
    version: "0.2",
    artifact_kind: "llm_profile_finalization_schema",
    required_command: 'node scripts/cli.mjs profile-finalize --synthesis synthesized_profile.json --questions interview_questions.json --answers-summary "..." --content profile_model_content.json --output ~/.investment-mirror',
    required_fields: [
      "profile_id",
      "evidence_summary",
      "interpretation_summary",
      "agent_interview_questions",
      "model_interview_answers_summary",
      "best_fit_master_matches",
      "primary_patterns",
      "active_guardrails",
      "risk_preference_summary",
      "time_horizon_summary",
      "constraints_summary",
      "false_match_warning",
      "unknown_dimensions",
      "final_profile_content or final_profile_content_path"
    ],
    final_profile_content_shape: {
      ui_language: "string such as en or zh-Hans",
      hero: ["positive_recognition", "status_line(optional metadata, not default visible chrome)", "user_decision_style", "why_master_match", "master_bio"],
      evidence: ["summary", "receipt_ids", "rows[source_type, what_scanned, how_used, takeaway] used for auditability; final HTML renders compact evidence-boundary metrics by default"],
      decision_pattern: {
        summary: "string",
        required_dimensions: DECISION_PATTERN_DIMENSIONS.map((dimension) => dimension.id),
        dimensions: ["id", "label", "read", "evidence_basis", "master_connection", "confidence", "caveat"]
      },
      master_lens: ["why_this_lens", "suitable_style", "what_to_learn", "what_not_to_copy"],
      interview_calibration: ["questions", "answers_summary", "unknown_dimensions"],
      guardrail_protocols: ["guardrail_id", "title", "rationale", "questions"],
      decision_review_cta: ["heading", "intro", "command_template", "fields(optional metadata, not rendered as generic chips by default)"],
      next_process_step: "string"
    },
    constants_written_by_finalizer: {
      synthesis_mode: "llm_synthesized",
      artifact_kind: "llm_synthesized_profile",
      profile_state: "finalized or provisional",
      llm_required: false
    },
    forbidden_content: [
      "buy/sell/hold recommendations",
      "allocation or position sizing",
      "suitability claims",
      "unsupported performance rankings",
      "raw transcript text by default"
    ],
    provisional_rule: "If the user declined interview or answers are absent, set provisional=true and list unknown_dimensions explicitly.",
    html_rule: "The agent/LLM produces structured final profile content. The finalizer renders profile.html with deterministic layout/safety rules. profile_report_template.html is a visual reference specimen only, not a fill-in template."
  };
}
function defaultCalibrationDimensionsToCheck() {
  return [
    {
      dimension: "risk_preference_loss_tolerance",
      why_needed: "Logs can reveal reasoning style, but they cannot reliably prove drawdown tolerance, regret tolerance, volatility tolerance, or opportunity cost tolerance.",
      agent_instruction: "After reviewing evidence, ask one concrete question about risk preference or loss tolerance if the answer is not directly provided by the user."
    },
    {
      dimension: "time_horizon",
      why_needed: "Evidence snippets may mention time, but the default intended horizon for public-equity decisions is a user-owned calibration input.",
      agent_instruction: "Ask the user to define the default horizon they actually intend for most public-equity decisions when evidence does not settle it."
    },
    {
      dimension: "liquidity_concentration_constraints",
      why_needed: "Personal liquidity needs, tax constraints, employment constraints, and concentration comfort cannot be inferred from transcript evidence.",
      agent_instruction: "Ask about constraints that should shape process guardrails, without asking for or giving position-size advice."
    },
    {
      dimension: "decision_threshold",
      why_needed: "The model must know what evidence is enough to move from research to a user-owned decision review.",
      agent_instruction: "Ask what two or three variables normally need to be true before the user stops researching and starts a decision review."
    },
    {
      dimension: "narrative_vs_price_threshold",
      why_needed: "A compelling story is not automatically an investable security; the user must calibrate how price, expectations, and falsification enter the process.",
      agent_instruction: "Ask what check should slow the user down before a strong story becomes an action candidate."
    },
    {
      dimension: "personal_non_observable_constraints",
      why_needed: "Some required calibration data is personal and non-observable, including tax, liquidity, employment, family, and psychological constraints.",
      agent_instruction: "Ask whether there are non-negotiable constraints the profile must respect, while avoiding financial advice."
    }
  ];
}
function guardrailReason(guardrail) {
  const reasons = {
    reverse_expectation_check_before_thematic_growth: "Keeps strong narratives connected to what the current price already assumes.",
    value_capture_check_before_platform_thesis: "Separates a real trend from shareholder value capture.",
    falsification_condition_before_position: "Prevents qualitative conviction from hardening into belief.",
    consensus_gap_check_before_contrarian_thesis: "Forces contrarian claims to define exactly what consensus believes.",
    research_loop_breaker_three_variable_rule: "Turns additional research into decision criteria.",
    user_defined_position_protocol: "Requires a user-defined process status without recommending position size.",
    cycle_regime_guardrail: "Adds cycle and regime sensitivity when the asset depends on macro conditions.",
    matched_master_blind_spot_check: "Keeps the useful master style without copying the blind spot."
  };
  return reasons[guardrail] ?? "Maps a recurring profile pattern to a repeatable decision-process check.";
}
function profileUpdate(options = {}) {
  const now = options.now ?? /* @__PURE__ */ new Date();
  const outputDir = defaultOutput(options.output);
  const finalProfile = readJson(join(outputDir, "profile.json"), null);
  const previousInputs = readJson(join(outputDir, "profile_candidate_inputs.json"), null);
  const result = generateInvestorProfile({ ...options, output: outputDir, now });
  const previousSpanCount = previousInputs?.source_summary.candidate_spans_found ?? previousInputs?.source_summary.decision_episodes_found ?? 0;
  const currentSpanCount = result.profile.source_summary.candidate_spans_found ?? 0;
  const update = {
    generated_at: iso(now),
    artifact_kind: "evidence_update_requires_llm_review",
    since: options.since ?? null,
    final_profile_preserved: Boolean(finalProfile),
    previous_candidate_spans_found: previousSpanCount,
    current_candidate_spans_found: currentSpanCount,
    candidate_spans_delta: currentSpanCount - previousSpanCount,
    model_review_required: true,
    model_review_instruction: "Read profile_evidence.json candidate_evidence_items and compare against the existing final profile plus master records before changing profile.json or profile.html.",
    candidate_inputs_path: join(outputDir, "profile_candidate_inputs.json"),
    candidate_report_path: join(outputDir, "profile_candidate_report.html"),
    final_profile_path: existsSync(join(outputDir, "profile.json")) ? join(outputDir, "profile.json") : null,
    final_html_path: existsSync(join(outputDir, "profile.html")) ? join(outputDir, "profile.html") : null
  };
  writeJson(join(outputDir, "profile_history", `${todayStamp(now)}-profile-update.json`), update);
  writeFileSync(join(outputDir, "profile_history", `${todayStamp(now)}-profile-update.html`), renderProfileUpdateHtml(update, result.profile), "utf8");
  return { ...result, update };
}
function lintInvestmentDecision(options) {
  const now = options.now ?? /* @__PURE__ */ new Date();
  const outputDir = defaultOutput(options.output);
  const save = options.writeLog ?? false;
  const artifactDir = save ? join(outputDir, "decisions") : join(outputDir, "decisions", "drafts");
  ensureDir(artifactDir);
  const profile = readJson(join(outputDir, "profile.json"), null);
  const parsed = parseDecision(options.thesis);
  const assumptions = decomposeThesis(options.thesis);
  const issues = generateIssues(options.thesis, parsed, profile);
  const status = issues.some((issue) => issue.severity === "P0") ? "blocked_by_p0_issues" : issues.length ? "needs_research" : "ready_for_user_decision";
  const slug = slugify(`${parsed.ticker ?? parsed.asset_or_theme} ${options.thesis}`);
  const decisionId = `dec_${todayStamp(now).replaceAll("-", "_")}_${slug.slice(0, 42).replaceAll("-", "_")}`;
  const htmlPath = join(artifactDir, `${todayStamp(now)}-${slug}.html`);
  const mdPath = join(artifactDir, `${todayStamp(now)}-${slug}.md`);
  const jsonPath = join(artifactDir, `${todayStamp(now)}-${slug}.json`);
  const triggeredGuardrails = [...new Set(issues.map((issue) => issue.triggered_guardrail).filter(Boolean))];
  const review = {
    decision_id: decisionId,
    created_at: iso(now),
    ticker: parsed.ticker,
    asset_or_theme: parsed.asset_or_theme,
    decision_type: parsed.decision_type,
    user_thesis: options.thesis,
    mode: profile ? "profile_aware" : "standalone",
    decision_status: status,
    assumptions,
    issues,
    triggered_guardrails: triggeredGuardrails,
    research_questions: researchQuestionsForIssues(issues),
    profile_context: profile ? `Personalized using ${profile.profile_id}; primary patterns: ${profile.primary_patterns.join(", ")}.` : "Generic thesis-clarification mode. Run /investment-profile-init for personalization.",
    closest_master_lens: profile?.best_fit_master_matches[0] ?? null,
    artifact_paths: { html: htmlPath, md: mdPath, json: jsonPath }
  };
  writeDecisionArtifacts(review, outputDir, options.writeLog ?? false);
  return review;
}
var TICKER_STOPWORDS = /* @__PURE__ */ new Set([
  "I",
  "A",
  "AN",
  "AND",
  "OR",
  "THE",
  "TO",
  "OF",
  "IN",
  "ON",
  "AT",
  "BY",
  "IS",
  "IT",
  "IF",
  "SO",
  "AS",
  "BE",
  "DO",
  "GO",
  "MY",
  "WE",
  "US",
  "UK",
  "EU",
  "USA",
  "AI",
  "ML",
  "LLM",
  "FSD",
  "EV",
  "TAM",
  "SAM",
  "DCF",
  "PE",
  "PEG",
  "EPS",
  "ROE",
  "ROIC",
  "ROI",
  "GDP",
  "CPI",
  "CEO",
  "CFO",
  "CTO",
  "COO",
  "IPO",
  "ETF",
  "ESG",
  "API",
  "SDK",
  "FAQ",
  "OK",
  "TBD",
  "FYI",
  "YOY",
  "QOQ",
  "ATH",
  "ATL",
  "NAV",
  "AUM",
  "REIT",
  "SPAC",
  "WACC",
  "FCF",
  "GMV",
  "DAU",
  "MAU",
  "ARR",
  "MRR"
]);
var ACTION_VERB_RE = /\b(?:buy|buying|sell|selling|add|adding|trim|trimming|hold|holding|short|shorting|long|own|owning|accumulate|accumulating|avoid|avoiding|watch|watching)\b/gi;
function parseDecision(thesis) {
  const lower = thesis.toLowerCase();
  const decisionTypes = ["buy", "sell", "add", "trim", "hold", "avoid", "watchlist", "research_only", "portfolio_review"];
  const decision_type = decisionTypes.find((type) => lower.includes(type.replace("_", " "))) ?? (lower.includes("research") ? "research_only" : null);
  const ticker = extractTicker(thesis);
  const asset_or_theme = ticker ?? cleanTheme(thesis);
  return { decision_type, ticker, asset_or_theme };
}
function extractTicker(thesis) {
  const cashtag = thesis.match(/\$([A-Za-z]{1,5})\b/);
  if (cashtag) return cashtag[1].toUpperCase();
  ACTION_VERB_RE.lastIndex = 0;
  let verbMatch;
  while (verbMatch = ACTION_VERB_RE.exec(thesis)) {
    const rest = thesis.slice(verbMatch.index + verbMatch[0].length);
    const after = rest.match(/^\s+(?:into\s+|some\s+|more\s+|the\s+)?([A-Z]{1,5})\b/);
    if (after && !TICKER_STOPWORDS.has(after[1])) return after[1];
  }
  const allCaps = thesis.match(/\b[A-Z]{2,5}\b/g) ?? [];
  const candidate = allCaps.find((token) => !TICKER_STOPWORDS.has(token));
  return candidate ?? null;
}
function cleanTheme(thesis) {
  const normalized = thesis.replace(/\s+/g, " ").trim();
  const stripped = normalized.replace(/^(?:i\s+(?:want|would like|am thinking|plan|intend|wish)\s+(?:to\s+)?(?:buy|sell|add|trim|hold|invest in|get into)?\s*)/i, "").trim();
  const theme = stripped.length >= 4 ? stripped : normalized;
  return theme.slice(0, 80);
}
function decomposeThesis(thesis) {
  const assumptions = [
    "The named business, asset, or theme has an identifiable mechanism that can affect value.",
    "The mechanism can occur within the user's stated or implied investment horizon.",
    "Shareholders or asset owners can capture enough of the value created by the mechanism.",
    "The current price does not already fully reflect the favorable version of the thesis.",
    "There is observable evidence that can confirm, weaken, or falsify the thesis."
  ];
  if (/ai|robotaxi|platform|cloud|tam|network/i.test(thesis)) assumptions.splice(2, 0, "The technology or platform trend translates into durable economics for this specific security.");
  if (/market|consensus|underprice|misprice/i.test(thesis)) assumptions.splice(1, 0, "Consensus expectations differ materially from the user's thesis.");
  return assumptions;
}
function generateIssues(thesis, parsed, profile) {
  const lower = thesis.toLowerCase();
  const issues = [];
  const add = (severity, code, title, why, guardrail, questions, pass) => {
    issues.push({
      issue_id: `ISSUE-${String(issues.length + 1).padStart(3, "0")}`,
      severity,
      title,
      issue_code: code,
      why_it_matters: why,
      triggered_guardrail: guardrail,
      questions,
      pass_condition: pass,
      status: "open"
    });
  };
  if (thesis.trim().length < 24) add("P0", "thesis_missing", "Thesis is not stated clearly", "A decision log needs a concrete mechanism, not only interest.", null, ["What exactly is the thesis?"], "Write a one-sentence thesis naming asset, mechanism, and horizon.");
  if (!parsed.decision_type) add("P0", "decision_type_missing", "Decision type unclear", "The process cannot distinguish buy, watchlist, research-only, add, trim, or avoid.", "user_defined_position_protocol", guardrailQuestions.user_defined_position_protocol, "Choose a process decision type.");
  if (!/(\d+\s*(m|mo|month|months|q|quarter|quarters|y|yr|year|years)|long[- ]term|short[- ]term|multi[- ]year|next\s+\d+)/i.test(thesis)) add("P0", "time_horizon_missing", "Time horizon missing", "Evidence and risk cannot be judged without a time horizon.", null, ["Over what horizon should this thesis be judged?"], "State the decision horizon.");
  if (!/valuation|multiple|dcf|price|priced|expectation|p\/e|ev\/|market cap|reverse/i.test(thesis)) add("P0", "valuation_expectation_missing", "Valuation expectation not checked", "A correct growth thesis can still disappoint if price already embeds the outcome.", "reverse_expectation_check_before_thematic_growth", guardrailQuestions.reverse_expectation_check_before_thematic_growth, "Define a price-expectation or reverse-expectation check.");
  if (!/falsif|wrong|disconfirm|change my mind|prove.*wrong|bear case/i.test(thesis)) add("P0", "falsification_missing", "No disconfirming evidence defined", "Without disconfirming evidence, the thesis can harden into belief.", "falsification_condition_before_position", guardrailQuestions.falsification_condition_before_position, "Name evidence that would weaken or falsify the thesis.");
  if (/ai|robotaxi|platform|tam|network effect|cloud|disrupt|autonomy|semiconductor/i.test(thesis) && !/capture|economics|margin|shareholder|monetiz|unit economics|pricing power/i.test(thesis)) add("P0", "value_capture_missing", "Trend-to-shareholder-value bridge missing", "A real trend can benefit users, suppliers, or competitors without benefiting this security.", "value_capture_check_before_platform_thesis", guardrailQuestions.value_capture_check_before_platform_thesis, "Explain who captures value and why shareholders benefit.");
  if (/(buy|add|position|sell|trim)/i.test(thesis) && !/risk|downside|drawdown|review|stop|limit|protocol/i.test(thesis)) add("P0", "downside_protocol_missing", "Downside protocol missing", "Action language appears before the user-defined risk protocol is explicit.", "user_defined_position_protocol", guardrailQuestions.user_defined_position_protocol, "State a user-defined process status and review boundary.");
  if (/(massive|obvious|huge|unlock|inevitable|will change everything|secular)/i.test(thesis)) add("P1", "narrative_to_action_jump", "Narrative-to-action jump", "The thesis moves from a large story to action before enough decision checks are installed.", "reverse_expectation_check_before_thematic_growth", guardrailQuestions.reverse_expectation_check_before_thematic_growth, "Insert valuation, capture, and falsification checks before action.");
  if (/market.*(wrong|missing|underpricing)|consensus|mispriced/i.test(thesis) && !/consensus believes|street expects|base case/i.test(lower)) add("P1", "consensus_gap_missing", "Consensus gap missing", "Contrarian claims need a specific consensus baseline.", "consensus_gap_check_before_contrarian_thesis", guardrailQuestions.consensus_gap_check_before_contrarian_thesis, "State what consensus believes and why you disagree.");
  if (/(moat|competition|competitive)/i.test(thesis) && !/(competitor|substitute|response|rival)/i.test(thesis)) add("P1", "competition_ignored", "Competitive response not addressed", "Moat claims need explicit competitor and substitute analysis.", null, ["How could competitors respond?", "Which customer or supplier captures bargaining power?"], "Add competitive response analysis.");
  if (/(ai|semiconductor|bank|housing|commodity|rates|fed|inflation|cycle)/i.test(thesis) && !/(cycle|regime|rates|demand|supply|liquidity)/i.test(thesis.replace(/ai/gi, ""))) add("P1", "cyclicality_ignored", "Cycle or regime not addressed", "Macro-sensitive theses need cycle variables.", "cycle_regime_guardrail", guardrailQuestions.cycle_regime_guardrail, "Name cycle variables and what would change the regime view.");
  if (/(buffett|munger|ackman|burry|analyst|guru|superinvestor|twitter|x post)/i.test(thesis)) add("P1", "authority_anchor", "Authority anchor", "Borrowed conviction should not stand in for independent evidence.", "matched_master_blind_spot_check", guardrailQuestions.matched_master_blind_spot_check, "Rewrite the thesis without authority references.");
  if (/(good|great|massive|cheap|expensive|long[- ]term)/i.test(thesis)) add("P2", "wording_vague", "Thesis wording too broad", "Broad adjectives hide assumptions that can be tested.", null, ["Which word should be converted into a measurable claim?"], "Replace vague wording with concrete assumptions.");
  if (profile) {
    for (const guardrail of profile.active_guardrails) {
      if (!issues.some((issue) => issue.triggered_guardrail === guardrail) && profile.primary_patterns.some((pattern) => lower.includes(pattern.replaceAll("_", " ")))) {
        add("P2", "prompt_pack_recommended", "Personalized prompt would help", "A recurring Investment Mirror pattern appears in this thesis.", guardrail, guardrailQuestions[guardrail] ?? [], "Run or save the matching prompt.");
      }
    }
  }
  return issues;
}
function researchQuestionsForIssues(issues) {
  const questions = /* @__PURE__ */ new Set();
  for (const issue of issues) {
    for (const question of issue.questions) questions.add(question);
  }
  if (!questions.size) {
    questions.add("What evidence would change this decision status?");
    questions.add("What is the strongest reason this could be a good idea but a poor investment?");
    questions.add("What should be reviewed next?");
  }
  return [...questions].slice(0, 8);
}
function mirrorAsk(question, output) {
  const outputDir = defaultOutput(output);
  const profile = readJson(join(outputDir, "profile.json"), null);
  const candidateInputs = readJson(join(outputDir, "profile_candidate_inputs.json"), null);
  const decisions = loadDecisionMemory(outputDir);
  const wantsRaw = wantsRawLocalEvidence(question);
  const terms = queryTerms(question);
  const memory = collectMemoryEvidence(outputDir, profile, candidateInputs, decisions);
  const ranked = rankMemoryEvidence(memory, terms).slice(0, 8);
  const rawEvidence = wantsRaw ? queryRedactedTurnEvidence(outputDir, terms).slice(0, 5) : [];
  const evidence = wantsRaw ? [...ranked, ...rawEvidence] : ranked;
  const guardrailCounts = countBy(decisions.flatMap((decision) => decision.triggered_guardrails ?? []));
  const mostFrequentGuardrail = Object.entries(guardrailCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const basis = [...new Set(evidence.map((item) => item.kind))];
  const interpretation = evidence.length ? `Based on local ${basis.join(", ")} records, the strongest answer is an interpretation of summarized evidence, not raw transcript review. Candidate/profile artifacts remain separate from finalized profile evidence.` : "No matching local Investment Mirror memory was found in profile summaries, decision logs, source summaries, or profile history.";
  return {
    question,
    search_terms: terms,
    data_scope: wantsRaw ? "profile/decision/source summaries plus explicitly requested redacted raw-turn SQLite search" : "profile/decision/source summaries only; raw transcript turns were not searched",
    evidence,
    interpretation,
    next_guardrail_or_review_action: mostFrequentGuardrail ?? profile?.active_guardrails[0] ?? candidateInputs?.active_guardrails[0] ?? "Run /investment-profile-init",
    raw_transcript_exposed: rawEvidence.length > 0
  };
}
function loadDecisionMemory(outputDir) {
  const decisions = /* @__PURE__ */ new Map();
  const logPath = join(outputDir, "decision_log.jsonl");
  if (existsSync(logPath)) {
    for (const line of readFileSync(logPath, "utf8").split(/\r?\n/).filter(Boolean)) {
      try {
        const decision = JSON.parse(line);
        decisions.set(decision.decision_id, decision);
      } catch {
      }
    }
  }
  const decisionsDir = join(outputDir, "decisions");
  if (existsSync(decisionsDir)) {
    for (const file of readdirSync(decisionsDir).filter((item) => item.endsWith(".json"))) {
      const decision = readJson(join(decisionsDir, file), null);
      if (decision?.decision_id) decisions.set(decision.decision_id, decision);
    }
  }
  return [...decisions.values()];
}
function collectMemoryEvidence(outputDir, profile, candidateInputs, decisions) {
  const evidence = [];
  if (profile) {
    evidence.push({
      id: `profile:${profile.profile_id}`,
      kind: "profile",
      source: "profile.json",
      summary: `Final profile ${profile.profile_id}; state=${profile.profile_state}; patterns=${profile.primary_patterns.join(", ")}; guardrails=${profile.active_guardrails.join(", ")}; master=${profile.best_fit_master_matches.map((match) => match.master_id).join(", ")}.`,
      matched_terms: []
    });
  }
  if (candidateInputs) {
    const spans = candidateInputs.source_summary.candidate_spans_found ?? 0;
    evidence.push({
      id: `candidate:${candidateInputs.profile_id}`,
      kind: "candidate_profile_inputs",
      source: "profile_candidate_inputs.json",
      summary: `Candidate retrieval workspace ${candidateInputs.profile_id}; candidate_spans_found=${spans}; model_review_required=${candidateInputs.source_summary.model_review_required === true}. No deterministic patterns, guardrails, or master matches are selected.`,
      matched_terms: []
    });
  }
  const packet = readJson(join(outputDir, "profile_evidence.json"), null);
  for (const item of packet?.candidate_evidence_items ?? []) {
    evidence.push({
      id: `evidence:${item.evidence_id}`,
      kind: "candidate_evidence",
      source: `${item.source_alias} (${item.source_type})`,
      summary: `Candidate evidence metadata; retrieval_score=${item.retrieval_score}; matched_signals=${item.matched_signals.slice(0, 8).join(", ")}. Redacted text is not exposed in default memory answers.`,
      matched_terms: []
    });
  }
  for (const decision of decisions) {
    evidence.push({
      id: `decision:${decision.decision_id}`,
      kind: "decision",
      source: decision.artifact_paths.json,
      summary: `${decision.decision_status}; thesis=${decision.user_thesis}; issues=${decision.issues.map((issue) => `${issue.severity}:${issue.issue_code}`).join(", ")}; guardrails=${decision.triggered_guardrails.join(", ")}.`,
      matched_terms: []
    });
  }
  const historyDir = join(outputDir, "profile_history");
  if (existsSync(historyDir)) {
    for (const file of readdirSync(historyDir).filter((item) => item.endsWith(".json")).slice(-40)) {
      const text = readFileSync(join(historyDir, file), "utf8");
      evidence.push({
        id: `history:${file}`,
        kind: "profile_history",
        source: `profile_history/${file}`,
        summary: text.replace(/\s+/g, " ").slice(0, 900),
        matched_terms: []
      });
    }
  }
  const manifest = readJson(join(outputDir, "source_manifest.json"), null);
  for (const source of manifest?.sources ?? []) {
    evidence.push({
      id: `source:${source.source_id}`,
      kind: "source_summary",
      source: source.source_id,
      summary: `source_id=${source.source_id}; type=${source.source_type}; status=${source.status}; modified=${source.modified_at}; path_hash=${source.path_hash}; sha256=${source.sha256}.`,
      matched_terms: []
    });
  }
  return evidence;
}
function queryTerms(question) {
  const lower = question.toLowerCase();
  const words = lower.match(/[a-z0-9_]{2,}|[\u4e00-\u9fff]{2,}/g) ?? [];
  const expanded = new Set(words);
  const expansions = [
    [/ai|人工智能|智能/i, ["ai", "artificial intelligence", "\u4EBA\u5DE5\u667A\u80FD", "platform", "semiconductor"]],
    [/guardrail|护栏|触发/i, ["guardrail", "guardrails", "triggered_guardrails", "\u89E6\u53D1"]],
    [/p0|blocked|blocker|阻塞|卡住/i, ["p0", "blocked_by_p0_issues", "blocked", "blocker"]],
    [/valuation|估值|price|价格/i, ["valuation", "price", "priced", "expectation", "valuation_expectation_missing", "\u4F30\u503C"]],
    [/falsif|wrong|证伪|反证/i, ["falsification", "falsification_missing", "wrong", "disconfirm", "\u8BC1\u4F2A"]],
    [/capture|shareholder|价值捕获/i, ["value_capture", "value_capture_missing", "shareholder", "capture", "\u4EF7\u503C\u6355\u83B7"]],
    [/master|大师|match|匹配/i, ["master", "match", "candidate_masters", "best_fit_master_matches", "\u5927\u5E08", "\u5339\u914D"]],
    [/profile|画像/i, ["profile", "candidate", "profile_state", "\u753B\u50CF"]]
  ];
  for (const [pattern, terms] of expansions) {
    if (pattern.test(question)) terms.forEach((term) => expanded.add(term));
  }
  return [...expanded].filter((term) => term.length >= 2).slice(0, 24);
}
function rankMemoryEvidence(memory, terms) {
  return memory.map((item) => {
    const haystack = `${item.id} ${item.kind} ${item.source} ${item.summary}`.toLowerCase();
    const matched = terms.filter((term) => haystack.includes(term.toLowerCase()));
    const score = matched.length + (item.kind === "decision" ? 0.25 : 0) + (item.kind === "profile" ? 0.2 : 0);
    return { item: { ...item, matched_terms: matched }, score };
  }).filter(({ score }) => score > 0 || terms.length === 0).sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id)).map(({ item }) => item);
}
function wantsRawLocalEvidence(question) {
  return /\braw\b|\btranscript\b|\bturns?\b|原始|原文|转录|逐字|raw local evidence/i.test(question);
}
function queryRedactedTurnEvidence(outputDir, terms) {
  const sqlitePath = join(outputDir, "source_index.sqlite");
  if (!existsSync(sqlitePath) || terms.length === 0) return [];
  const script = join(skillRoot, "scripts", "query_source_index.py");
  const result = spawnSync("python3", [script, sqlitePath, ...terms.slice(0, 8)], { encoding: "utf8" });
  if (result.status !== 0 || !result.stdout.trim()) return [];
  try {
    const rows = JSON.parse(result.stdout);
    return rows.map((row) => ({
      id: `redacted_turn:${row.turn_id}`,
      kind: "redacted_turn",
      source: row.source_id,
      summary: row.snippet,
      matched_terms: row.matched_terms
    }));
  } catch {
    return [];
  }
}
function writeCandidateProfileArtifacts(outputDir, profile, evidenceItems, now, kind) {
  writeJson(join(outputDir, "profile_candidate_inputs.json"), profile);
  writeJson(join(outputDir, "profile_history", `${todayStamp(now)}-${kind}-candidate-inputs.json`), profile);
  writeProfileState(outputDir, "interview_required", now, "Deterministic evidence compilation completed; agent/LLM interview and synthesis are required before final profile files can be written.");
  writeFileSync(join(outputDir, "guardrails.yaml"), import_yaml.default.stringify({
    version: "0.2",
    artifact_kind: "guardrail_selection_requires_llm_synthesis",
    instruction: "No guardrails are selected by deterministic profile-init. The agent/LLM must read profile_evidence.json, compare evidence with the guardrail catalog, and write final active_guardrails plus guardrail_protocols during profile-finalize.",
    available_guardrail_catalog: Object.keys(guardrailQuestions).map((guardrail) => ({
      guardrail_id: guardrail,
      name: guardrailName(guardrail),
      reference_questions: guardrailQuestions[guardrail]
    }))
  }), "utf8");
  writeFileSync(join(outputDir, "prompt_pack.md"), renderPromptPack(profile), "utf8");
  writeFileSync(join(outputDir, "InvestmentMirror.md"), renderInvestmentMirror(profile), "utf8");
  const html = renderProfileCandidateReportHtml(profile, evidenceItems, outputDir);
  writeFileSync(join(outputDir, "profile_candidate_report.html"), html, "utf8");
  writeFileSync(join(outputDir, "profile_history", `${todayStamp(now)}-${kind}-candidate-report.html`), html, "utf8");
}
function writeDecisionArtifacts(review, outputDir, writeLog) {
  writeFileSync(review.artifact_paths.html, renderDecisionHtml(review, outputDir), "utf8");
  writeFileSync(review.artifact_paths.md, renderDecisionMarkdown(review), "utf8");
  writeJson(review.artifact_paths.json, review);
  if (writeLog) {
    appendFileSync(join(outputDir, "decision_log.jsonl"), `${JSON.stringify({ ...review, decision_status: "decision_logged" })}
`, "utf8");
    appendFileSync(join(outputDir, "InvestmentMirror.md"), `
## Decision ${review.decision_id}

- Status: ${review.decision_status}
- Thesis: ${review.user_thesis}
- Issues: ${review.issues.map((issue) => `${issue.severity} ${issue.title}`).join("; ")}
`, "utf8");
  }
}
var DEFAULT_ASSET_BASE_URL = "https://raw.githubusercontent.com/FUY25/investment-mirror-skill/main/assets/masters";
function assetBaseUrl() {
  return (process.env.INVESTMENT_MIRROR_ASSET_BASE_URL || DEFAULT_ASSET_BASE_URL).replace(/\/+$/, "");
}
var PY_FETCH_ASSET = [
  "import sys,urllib.request",
  "url=sys.argv[1]",
  "req=urllib.request.Request(url, headers={'User-Agent':'investment-mirror'})",
  "sys.stdout.buffer.write(urllib.request.urlopen(req, timeout=10).read())"
].join("\n");
function resolveMasterAsset(masterId, outputDir) {
  const cachePath = join(outputDir, ".asset_cache", "masters", `${masterId}.svg`);
  if (existsSync(cachePath)) {
    try {
      return readFileSync(cachePath, "utf8");
    } catch {
    }
  }
  const svg = fetchMasterAsset(masterId);
  if (svg == null) return null;
  try {
    ensureDir(dirname(cachePath));
    writeFileSync(cachePath, svg, "utf8");
  } catch {
  }
  return svg;
}
function fetchMasterAsset(masterId) {
  const base = assetBaseUrl();
  try {
    if (base.startsWith("file://")) {
      const filePath = fileURLToPath(`${base}/${masterId}.svg`);
      return existsSync(filePath) ? readFileSync(filePath, "utf8") : null;
    }
    if (base.startsWith("/")) {
      const filePath = join(base, `${masterId}.svg`);
      return existsSync(filePath) ? readFileSync(filePath, "utf8") : null;
    }
    const result = spawnSync("python3", ["-c", PY_FETCH_ASSET, `${base}/${masterId}.svg`], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
    if (result.status === 0 && result.stdout) return result.stdout;
    return null;
  } catch {
    return null;
  }
}
function masterPortraitDataUri(masterId, outputDir) {
  const svg = resolveMasterAsset(masterId, outputDir);
  if (!svg) return null;
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}
function masterPortraitImg(masterId, displayName, outputDir) {
  const uri = masterPortraitDataUri(masterId, outputDir);
  if (uri) return `<img src="${uri}" alt="${escapeHtml(displayName)} line-art portrait">`;
  return `<div class="master-portrait-fallback" role="img" aria-label="${escapeHtml(displayName)} portrait unavailable offline"><span>${escapeHtml(masterInitials(displayName))}</span></div>`;
}
function masterInitials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}
function renderPromptPack(profile) {
  return `# Investment Mirror Prompt Pack

This prompt pack is generic until \`profile-finalize\` writes a model-synthesized profile. It is not personalized by deterministic profile-init.

## Anti-narrative Prompt

Help me separate a true story from an investable security. Name the story, the security-specific bridge, the price expectations, and the evidence that would disconfirm my view. Do not tell me whether to buy.

## Valuation Discipline Prompt

Run a reverse-expectation check on this thesis. What must the current price already assume, and what would have to be true for expected return to be attractive? Do not provide a recommendation.

## Falsification Prompt

Turn my thesis into testable claims. For each claim, list evidence that would weaken it within my stated horizon.

## Consensus Gap Prompt

Define market consensus for this idea, then define exactly where my view differs. List the evidence that would prove consensus right.

## Research-loop Breaker Prompt

Reduce this investment idea to three decision variables. For each variable, state pass, fail, and unknown conditions. Stop adding sources unless they change one variable.

## Good-company-bad-stock Prompt

Assume this is a great company but a poor stock from here. What would make that true? Check valuation, value capture, competition, and expectations.

## Post-decision Review Prompt

Review this logged decision without judging the outcome. Which assumptions were explicit, which were missing, and which guardrail would have improved the process?

## Best-fit Master Learning Prompt

I am attracted to this investment idea. Read my finalized Investment Mirror profile if available; otherwise read \`profile_evidence.json\` and relevant \`research/masters/{master_id}\` records before selecting any learning lens.

First explain what is strong about how I am approaching this thesis. Then help me make the thesis more investable using:
1. a model-selected learning lens grounded in evidence, not deterministic similarity;
2. a valuation expectation check;
3. a good-company-bad-stock check;
4. a falsification condition;
5. a value-capture check.

Do not tell me whether to buy. Turn my thesis into issues, questions, and guardrails.
`;
}
function renderInvestmentMirror(profile) {
  const spans = profile.source_summary.candidate_spans_found ?? 0;
  return `# Investment Mirror

## Evidence Workspace

This file was generated from deterministic local evidence preparation. It is not a finalized profile. The agent/LLM must read \`profile_evidence.json\`, decide which evidence matters, compare against master records, ask calibration questions, synthesize profile JSON and structured profile content, then run profile-finalize to validate and write profile.json and profile.html.

Prepared redacted candidate evidence spans: ${spans}.
Sources scanned: ${profile.source_summary.conversations_scanned}.

## Model-Owned Phases

1. Interpret the redacted candidate evidence ledger.
2. Decide which spans are true decision evidence and which are false positives.
3. Compare evidence with \`research/masters/{master_id}\` records before choosing any master lens.
4. Ask 2-5 targeted calibration questions.
5. Write \`synthesized_profile.json\` and \`profile_model_content.json\`.
6. Run \`profile-finalize\`.

## Decision Log Index

| Date | Asset | Decision Type | Status | Triggered Issues |
|---|---|---|---|---|

## Open Follow-ups

- Complete model synthesis and finalization before using personalized guardrails.
`;
}
function renderDecisionMarkdown(review) {
  return `# Decision Review ${review.decision_id}

Investment Mirror does not provide investment, legal, tax, or financial advice. It helps structure your reasoning, identify unresolved issues, and keep a decision log. You remain responsible for your own decisions.

## Decision Summary

- Mode: ${review.mode}
- Process status: ${review.decision_status}
- Decision type: ${review.decision_type ?? "unclear"}
- Asset/theme: ${review.asset_or_theme}

## Thesis

${review.user_thesis}

## Assumptions

${review.assumptions.map((assumption, index) => `${index + 1}. ${assumption}`).join("\n")}

## Issues

${review.issues.map((issue) => `### [${issue.severity}] ${issue.issue_id}: ${issue.title}

Why this matters: ${issue.why_it_matters}

Triggered guardrail: ${issue.triggered_guardrail ?? "none"}

Pass condition: ${issue.pass_condition}
`).join("\n")}

## Guided Research Questions

${review.research_questions.map((question, index) => `${index + 1}. ${question}`).join("\n")}
`;
}
function renderProfileReportTemplate(profile, outputDir) {
  const primary = profile.best_fit_master_matches[0];
  const masterReferenceFigure = primary ? `<figure class="master-stamp">
        ${masterPortraitImg(primary.master_id, primary.display_name, outputDir)}
        <figcaption><b>${escapeHtml(primary.display_name)}</b>${escapeHtml(primary.bio_summary)}</figcaption>
      </figure>` : `<figure class="master-stamp">
        <div class="master-portrait-fallback" role="img" aria-label="Model-selected master lens pending"><span>AI</span></div>
        <figcaption><b>Selected after evidence review</b>The master lens is chosen only after the agent/LLM reads evidence and master records.</figcaption>
      </figure>`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Investment Mirror AI HTML Reference</title>
  ${sharedReportCss()}
</head>
<body>
  <!--
    Investment Mirror AI HTML reference.
    This is not a fill-in template and must not be copied with placeholder text.
    The agent/LLM must generate structured final profile content after full
    evidence analysis, interview calibration, and model-owned master/profile
    synthesis. The finalizer renders canonical profile.html.
  -->
  <main class="page-shell model-template" data-reference="investment-mirror-profile-html-reference-v0.2">
    <section class="candidate-banner">
      <p class="kicker">AI HTML Reference</p>
      <p>This is a visual and structural reference for the final report. Do not copy placeholder text. The agent/LLM writes structured content; the finalizer renders the static report.</p>
    </section>

    <section class="hero-grid hero-profile final-profile-report">
      ${masterReferenceFigure}
      <div class="hero-copy">
        <p class="kicker">Investment Mirror / Finalized Profile</p>
        <h1>Investment Decision Profile</h1>
        <p class="decision-copy"><strong>User decision style:</strong> Open with one sharp paragraph about how the user makes investment decisions.</p>
        <p class="decision-copy"><strong>Why this resembles the master:</strong> Explain the process similarity, not identity, authority, specific holdings, or performance.</p>
      </div>
    </section>

    <section class="sheet evidence-sheet">
      <div class="section-heading">
        <h2>Evidence Boundary</h2>
      </div>
      <dl class="metric-row">
        <div><dt>Sources scanned</dt><dd>${profile.source_summary.conversations_scanned}</dd></div>
        <div><dt>Direct equity episodes</dt><dd>${profile.source_summary.decision_episodes_found}</dd></div>
        <div><dt>Retained receipts</dt><dd>${profile.source_summary.receipts_used}</dd></div>
      </dl>
    </section>

    <section>
      <div class="section-heading">
        <h2>Six-Dimension Decision Profile</h2>
      </div>
      <div class="pattern-grid">
        ${DECISION_PATTERN_DIMENSIONS.map((dimension) => `<article class="pattern-card">
          <span>${escapeHtml(dimension.label)}<small>${escapeHtml(dimension.id)}</small></span>
          <p>Write two concise, concrete sentences about this investment-process dimension.</p>
          <p class="evidence-signal"><b>Evidence</b> Name the evidence boundary that supports this read without restating raw transcripts.</p>
        </article>`).join("")}
      </div>
    </section>

    <section class="section-grid">
      <article>
        <h2>What to learn from the master</h2>
        <p>Describe the user's suitable investment style and the specific process habits to learn from the selected master lens.</p>
        <h3>Suitable style</h3>
        <ul><li>Write process-fit guidance, not buy/sell/allocation guidance.</li></ul>
        <h3>Watch-outs</h3>
        <ul><li>State what not to copy from the master and what evidence remains thin.</li></ul>
      </article>
    </section>

    <section>
      <h2>Pre-Investment Guardrail</h2>
      <p class="guardrail-intro">Guardrails are questions the user asks before an idea enters decision review. They are not recommendations.</p>
      <div class="guardrails">
        ${(profile.active_guardrails.length ? profile.active_guardrails : ["model_selected_guardrail"]).slice(0, 5).map((guardrail) => `<article><span>${escapeHtml(guardrail === "model_selected_guardrail" ? "Model guardrail" : guardrailName(guardrail))}</span><p>Explain why this question matters for the user's process.</p><ul>${(guardrailQuestions[guardrail] ?? ["Write one user-specific pre-investment question."]).slice(0, 1).map((question) => `<li>${escapeHtml(question)}</li>`).join("")}</ul></article>`).join("")}
      </div>
    </section>

    <section class="sheet cta-section">
      <h2>Next: run /investment-decision</h2>
      <p>The report ends by introducing the profile-aware decision skill. It should help the user review one thesis through price expectations, catalyst, deterioration evidence, constraints, and research steps.</p>
      <pre><code>/investment-decision Research-only review of [ticker/asset/theme] over [horizon].</code></pre>
    </section>

    <footer>Investment Mirror does not provide investment, legal, tax, or financial advice. It structures your reasoning; you remain responsible for your decisions.</footer>
  </main>
</body>
</html>`;
}
function renderFinalProfileHtml(profile, content, outputDir) {
  const primary = profile.best_fit_master_matches[0];
  const status = profile.profile_state === "provisional" ? "Provisional" : "Finalized";
  const labels = profileUiLabels(content);
  const recognition = content.hero?.positive_recognition ?? profile.interpretation_summary ?? labels.defaultRecognition;
  const userDecisionStyle = content.hero?.user_decision_style ?? recognition;
  const whyMasterMatch = content.hero?.why_master_match ?? content.master_lens?.why_this_lens ?? primary.why_match;
  const masterBio = content.hero?.master_bio ?? primary.bio_summary;
  const patternDimensions = normalizeDecisionPatternDimensions(content.decision_pattern?.dimensions);
  const masterRationale = content.master_lens?.why_this_lens ?? primary.why_match;
  const suitableStyle = content.master_lens?.suitable_style ?? masterRationale;
  const learn = normalizeOptionalStringArray(content.master_lens?.what_to_learn, primary.what_to_learn);
  const avoid = normalizeOptionalStringArray(content.master_lens?.what_not_to_copy, primary.what_not_to_copy);
  const unknowns = Array.isArray(content.interview_calibration?.unknown_dimensions) ? normalizeStringArray(content.interview_calibration?.unknown_dimensions) : normalizeStringArray(profile.unknown_dimensions);
  const guardrails = (content.guardrail_protocols?.length ? content.guardrail_protocols : profile.active_guardrails.map((guardrail) => ({
    guardrail_id: guardrail,
    title: guardrailName(guardrail),
    rationale: guardrailReason(guardrail),
    questions: guardrailQuestions[guardrail] ?? []
  }))).slice(0, 5);
  const cta = content.decision_review_cta ?? defaultDecisionReviewCta(labels);
  const nextStep = content.next_process_step ?? labels.defaultNextStep;
  return `<!doctype html>
<html lang="${escapeHtml(labels.lang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Investment Mirror ${escapeHtml(status)} Profile</title>
  ${sharedReportCss()}
</head>
<body>
  <main class="page-shell final-profile-report" data-profile-state="${escapeHtml(status.toLowerCase())}">
    <section class="hero-grid hero-profile">
      <figure class="master-stamp">
        ${masterPortraitImg(primary.master_id, primary.display_name, outputDir)}
        <figcaption><b>${escapeHtml(primary.display_name)}</b>${escapeHtml(masterBio)}</figcaption>
      </figure>
      <div class="hero-copy">
        <p class="kicker">Investment Mirror / ${escapeHtml(status)} Profile</p>
        <h1>${escapeHtml(labels.profileTitle)}</h1>
        <p class="decision-copy"><strong>${escapeHtml(labels.userDecisionStylePrefix)}</strong>${escapeHtml(userDecisionStyle)}</p>
        <p class="decision-copy"><strong>${escapeHtml(labels.whyMasterMatchPrefix.replace("{master}", primary.display_name))}</strong>${escapeHtml(whyMasterMatch)}</p>
      </div>
    </section>

    <section class="sheet evidence-sheet">
      <div class="section-heading">
        <h2>${escapeHtml(labels.evidenceBoundary)}</h2>
      </div>
      <dl class="metric-row">
        <div><dt>${escapeHtml(labels.sourcesScanned)}</dt><dd>${profile.source_summary.conversations_scanned}</dd></div>
        <div><dt>${escapeHtml(labels.directEquityEpisodes)}</dt><dd>${profile.source_summary.decision_episodes_found}</dd></div>
        <div><dt>${escapeHtml(labels.retainedReceipts)}</dt><dd>${profile.source_summary.receipts_used}</dd></div>
      </dl>
    </section>

    <section>
      <div class="section-heading">
        <h2>${escapeHtml(labels.sixDimensionDecisionProfile)}</h2>
      </div>
      <div class="pattern-grid">
        ${patternDimensions.map((dimension) => {
    const display = decisionPatternDisplayName(dimension.id ?? "", dimension.label, labels.lang);
    return `<article class="pattern-card">
          <span>${escapeHtml(display.title)}${display.subtitle ? `<small>${escapeHtml(display.subtitle)}</small>` : ""}</span>
          <p>${escapeHtml(dimension.read ?? "")}</p>
          ${dimension.evidence_basis ? `<p class="evidence-signal"><b>${escapeHtml(labels.evidenceBasis)}</b> ${escapeHtml(dimension.evidence_basis)}</p>` : ""}
        </article>`;
  }).join("")}
      </div>
    </section>

    ${profile.profile_state === "provisional" && unknowns.length ? `<section>
      <h2>Unknown Dimensions</h2>
      <ul>${unknowns.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </section>` : ""}

    <section class="section-grid">
      <article>
        <h2>${escapeHtml(labels.whatToLearnFromMaster.replace("{master}", primary.display_name))}</h2>
        <p>${escapeHtml(suitableStyle)}</p>
        ${content.master_lens?.suitable_style ? `<p>${escapeHtml(masterRationale)}</p>` : ""}
        <h3>${escapeHtml(labels.whatToLearn)}</h3>
        <ul>${learn.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        <h3>${escapeHtml(labels.watchOuts)}</h3>
        <ul>${avoid.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </article>
    </section>

    <section>
      <h2>${escapeHtml(labels.preInvestmentGuardrail)}</h2>
      <p class="guardrail-intro">${escapeHtml(labels.guardrailIntro)}</p>
      <div class="guardrails">
        ${guardrails.map((guardrail) => `<article><span>${escapeHtml(guardrail.title ?? guardrailName(guardrail.guardrail_id ?? ""))}</span><p>${escapeHtml(guardrail.rationale ?? guardrailReason(guardrail.guardrail_id ?? ""))}</p><ul>${normalizeStringArray(guardrail.questions).map((question) => `<li>${escapeHtml(question)}</li>`).join("")}</ul></article>`).join("")}
      </div>
    </section>

    <section class="sheet cta-section">
      <h2>${escapeHtml(labels.decisionSkillHeading)}</h2>
      <p>${escapeHtml(cta.intro ?? nextStep)}</p>
      <pre><code>${escapeHtml(cta.command_template ?? labels.defaultDecisionCommand)}</code></pre>
      <p>${escapeHtml(nextStep)}</p>
    </section>

    <footer>${escapeHtml(labels.safetyFooter)}</footer>
  </main>
</body>
</html>`;
}
function profileUiLabels(content) {
  const zh = String(content.ui_language ?? "").toLowerCase().startsWith("zh");
  const defaults = zh ? {
    lang: "zh-Hans",
    profileTitle: "\u6295\u8D44\u51B3\u7B56\u753B\u50CF\u62A5\u544A",
    defaultRecognition: "\u4F60\u7684\u6295\u8D44\u51B3\u7B56\u753B\u50CF",
    defaultPatternSummary: "\u8FD9\u4E2A\u753B\u50CF\u63CF\u8FF0\u4F60\u5982\u4F55\u5F62\u6210\u3001\u6821\u9A8C\u3001\u63A8\u8FDB\u548C\u590D\u76D8\u6295\u8D44\u5224\u65AD\u3002",
    defaultNextStep: "\u4E0B\u4E00\u6B65\u53EF\u4EE5\u7528 /investment-decision \u8DD1\u4E00\u4E2A\u5177\u4F53 thesis\uFF0C\u628A\u8FD9\u4E2A profile \u53D8\u6210 process review\u3002",
    defaultDecisionCommand: `/investment-decision Research-only review of [\u80A1\u7968/\u4EE3\u7801/\u4E3B\u9898] over [\u65F6\u95F4\u8303\u56F4].

My thesis:
[\u5199\u4E00\u53E5\u4F60\u7684 thesis]

What I think the current price already implies:
[\u5199\u5F53\u524D\u4EF7\u683C\u4F3C\u4E4E\u5DF2\u7ECF\u53CD\u6620\u4E86\u4EC0\u4E48]

Catalyst I would need to see:
[\u5199\u672A\u6765\u4EC0\u4E48\u4E8B\u4EF6/\u6570\u636E\u4F1A\u8BA9\u8FD9\u4E2A thesis \u503C\u5F97\u7EE7\u7EED review]

What would weaken or falsify the thesis:
[\u5199\u4EC0\u4E48\u8BC1\u636E\u4F1A\u8BF4\u660E thesis deterioration]

Constraints or review boundaries:
[\u5199 liquidity / tax / employment / concentration / drawdown / time horizon \u7B49\u8FB9\u754C\uFF1B\u6CA1\u6709\u5C31\u5199 no constraints stated]`,
    userDecisionStylePrefix: "\u4F60\u7684\u51B3\u7B56\u98CE\u683C\uFF1A",
    whyMasterMatchPrefix: "\u4E3A\u4EC0\u4E48\u50CF {master}\uFF1A",
    bestFitMasterLens: "Best-fit master lens",
    readMore: "Read more",
    profileState: "Profile state",
    evidenceScanned: "Evidence scanned",
    evidenceBoundary: "\u8BC1\u636E\u8FB9\u754C",
    sourcesScanned: "Sources scanned",
    candidateEvidence: "Candidate evidence",
    directEquityEpisodes: "Direct equity episodes",
    receiptSummaries: "Receipt summaries",
    retainedReceipts: "Retained receipts",
    evidenceSourceType: "Source type",
    evidenceWhatScanned: "What was scanned",
    evidenceHowUsed: "How it was used",
    evidenceTakeaway: "Takeaway",
    receipts: "Receipts",
    decisionPattern: "Decision Pattern",
    sixDimensionDecisionProfile: "\u516D\u7EF4\u51B3\u7B56\u753B\u50CF",
    evidenceBasis: "Evidence",
    masterConnection: "Master connection",
    masterLens: "Master Lens",
    whatToLearnFromMaster: "\u4ECE {master} \u80FD\u5B66\u5230\u4EC0\u4E48",
    whatToLearn: "\u9002\u5408\u4F60\u7684\u6295\u8D44\u98CE\u683C",
    whatNotToCopy: "What not to copy",
    watchOuts: "\u6CE8\u610F\u4E8B\u9879",
    calibrationNotes: "Calibrated facts",
    horizon: "Horizon",
    reviewBoundary: "Review boundary",
    constraints: "Constraints",
    guardrailProtocol: "Guardrail Protocol",
    preInvestmentGuardrail: "\u6295\u8D44\u524D Guardrail",
    guardrailIntro: "Guardrail \u4E0D\u662F\u7ED3\u8BBA\uFF0C\u4E5F\u4E0D\u662F\u98CE\u9669\u8B66\u544A\uFF1B\u5B83\u662F\u6295\u8D44\u524D\u5FC5\u987B\u95EE\u81EA\u5DF1\u7684\u95EE\u9898\u3002\u6BCF\u4E2A\u95EE\u9898\u90FD\u5BF9\u5E94\u4F60\u7684 profile \u91CC\u6700\u5BB9\u6613\u88AB\u8DF3\u8FC7\u7684\u73AF\u8282\uFF1A\u4EF7\u683C\u3001\u8BC1\u636E\u3001\u50AC\u5316\u5242\u548C thesis \u53D8\u574F\u7684\u8FB9\u754C\u3002",
    runDecisionReview: "Run a Decision Review",
    decisionSkillHeading: "\u4E0B\u4E00\u6B65\uFF1A\u8BA9 decision skill \u966A\u4F60\u8DD1\u4E00\u904D",
    safetyFooter: "Investment Mirror does not provide investment, legal, tax, or financial advice. \u5B83\u53EA\u5E2E\u4F60\u7ED3\u6784\u5316\u63A8\u7406\uFF1B\u6700\u7EC8\u51B3\u7B56\u4ECD\u7531\u4F60\u8D1F\u8D23\u3002Raw transcripts are not exposed in this report."
  } : {
    lang: "en",
    profileTitle: "Investment Decision Profile",
    defaultRecognition: "Your investment decision profile",
    defaultPatternSummary: "This profile describes how you form, test, advance, and review investment judgments.",
    defaultNextStep: "Use /investment-decision on one current thesis to turn this profile into a process review.",
    defaultDecisionCommand: `/investment-decision Research-only review of [ticker/asset/theme] over [horizon].

My thesis:
[write one thesis sentence]

What I think the current price already implies:
[write what seems priced in]

Catalyst I would need to see:
[write the evidence or event needed within the horizon]

What would weaken or falsify the thesis:
[write the deterioration condition]

Constraints or review boundaries:
[write liquidity / tax / employment / concentration / drawdown / time horizon boundaries; if none are stated, write no constraints stated]`,
    userDecisionStylePrefix: "Your decision style: ",
    whyMasterMatchPrefix: "Why this resembles {master}: ",
    bestFitMasterLens: "Best-fit master lens",
    readMore: "Read more",
    profileState: "Profile state",
    evidenceScanned: "Evidence scanned",
    evidenceBoundary: "Evidence Boundary",
    sourcesScanned: "Sources scanned",
    candidateEvidence: "Candidate evidence",
    directEquityEpisodes: "Direct equity episodes",
    receiptSummaries: "Receipt summaries",
    retainedReceipts: "Retained receipts",
    evidenceSourceType: "Source type",
    evidenceWhatScanned: "What was scanned",
    evidenceHowUsed: "How it was used",
    evidenceTakeaway: "Takeaway",
    receipts: "Receipts",
    decisionPattern: "Decision Pattern",
    sixDimensionDecisionProfile: "Six-Dimension Decision Profile",
    evidenceBasis: "Evidence",
    masterConnection: "Master connection",
    masterLens: "Master Lens",
    whatToLearnFromMaster: "What to learn from {master}",
    whatToLearn: "Suitable style",
    whatNotToCopy: "What not to copy",
    watchOuts: "Watch-outs",
    calibrationNotes: "Calibrated facts",
    horizon: "Horizon",
    reviewBoundary: "Review boundary",
    constraints: "Constraints",
    guardrailProtocol: "Guardrail Protocol",
    preInvestmentGuardrail: "Pre-Investment Guardrail",
    guardrailIntro: "A guardrail is a question to ask before an idea enters decision review. It is not a recommendation, warning label, or position-size rule.",
    runDecisionReview: "Run a Decision Review",
    decisionSkillHeading: "Next: run the decision skill",
    safetyFooter: "Investment Mirror does not provide investment, legal, tax, or financial advice. It structures your reasoning; you remain responsible for your decisions. Raw transcripts are not exposed in this report."
  };
  return { ...defaults, ...content.labels ?? {} };
}
function normalizeDecisionPatternDimensions(dimensions) {
  const list = Array.isArray(dimensions) ? dimensions : [];
  const byId = new Map(list.map((dimension) => [dimension.id, dimension]));
  return DECISION_PATTERN_DIMENSIONS.map((required) => byId.get(required.id) ?? {
    id: required.id,
    label: required.label,
    read: "",
    evidence_basis: "",
    master_connection: ""
  });
}
function labelForDecisionPatternDimension(id) {
  return DECISION_PATTERN_DIMENSIONS.find((dimension) => dimension.id === id)?.label ?? humanize(id);
}
function decisionPatternDisplayName(id, fallback, lang) {
  const english = fallback || labelForDecisionPatternDimension(id);
  if (lang !== "zh-Hans") {
    return { title: english, subtitle: id ? humanize(id) : "" };
  }
  const zhLabels = {
    philosophy: { title: "\u6295\u8D44\u54F2\u5B66", subtitle: "Philosophy" },
    decision_making_process: { title: "\u51B3\u7B56\u6D41\u7A0B", subtitle: "Decision-making process" },
    research_process: { title: "\u7814\u7A76\u6D41\u7A0B", subtitle: "Research process" },
    buy_sell_discipline: { title: "\u4E70\u5356\u7EAA\u5F8B", subtitle: "Buy/sell discipline" },
    risk_process: { title: "\u98CE\u9669\u6D41\u7A0B", subtitle: "Risk process" },
    repeatability: { title: "\u53EF\u590D\u76D8\u6027", subtitle: "Repeatability" }
  };
  return zhLabels[id] ?? { title: english, subtitle: id ? humanize(id) : "" };
}
function defaultDecisionReviewCta(labels) {
  return {
    heading: labels.runDecisionReview,
    intro: labels.defaultNextStep,
    command_template: labels.defaultDecisionCommand,
    fields: []
  };
}
function renderProfileCandidateReportHtml(profile, evidenceItems, outputDir) {
  const topItems = evidenceItems.slice(0, 40);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Investment Mirror Candidate Evidence Report</title>
  ${sharedReportCss()}
</head>
<body>
  <main class="page-shell">
    <section class="candidate-banner">
      <p class="kicker">Evidence workbench</p>
      <p>This artifact was generated by deterministic local tooling for source discovery, redaction, retrieval scoring, and full candidate evidence extraction. It is not a profile draft, pattern judgment, guardrail selection, or master match. The agent/LLM must read the evidence, reject false positives, compare against master records, form questions, and synthesize the final profile.</p>
    </section>
    <section class="hero-grid">
      <div>
        <p class="kicker">Investment Mirror</p>
        <h1>Redacted evidence is ready for model review.</h1>
        <p class="lead">${evidenceItems.length} candidate evidence spans were prepared for agent/LLM review. Retrieval scores and matched signals are search aids only.</p>
        <div class="confidence"><span>Analysis scope</span><strong>Full candidate evidence ledger</strong></div>
      </div>
      <article class="master-card primary">
        <div class="master-portrait-fallback" role="img" aria-label="Model analysis pending"><span>LLM</span></div>
        <div>
          <p class="label">Model-owned judgment pending</p>
          <h2>No deterministic master match</h2>
          <p>The model must compare reviewed evidence with master records before selecting any learning lens.</p>
        </div>
      </article>
    </section>

    <section class="report-stack">
      <article class="sheet">
        <h2>Source Coverage</h2>
        <dl>
          <div><dt>Sources scanned</dt><dd>${profile.source_summary.conversations_scanned}</dd></div>
          <div><dt>Redacted turns indexed</dt><dd>${profile.source_summary.redacted_turns_indexed ?? 0}</dd></div>
          <div><dt>Candidate evidence spans</dt><dd>${evidenceItems.length}</dd></div>
        </dl>
      </article>
      <article class="sheet offset">
        <h2>Retrieval Contract</h2>
        <p>Matched signals explain why a span was retrieved. They do not classify the user's style, select a master, or choose guardrails.</p>
      </article>
    </section>

    <section class="section-grid">
      <article>
        <h2>Model Must Decide</h2>
        <ol>
          <li>Which spans are true decision evidence.</li>
          <li>Which patterns are actually supported.</li>
          <li>Which master lens is useful after reading master records.</li>
          <li>Which guardrails fit the user after calibration.</li>
        </ol>
      </article>
      <article>
        <h2>Calibration Dimensions</h2>
        ${(profile.calibration_question_topics ?? defaultCalibrationDimensionsToCheck()).map((topic) => `<div class="pattern"><strong>${escapeHtml(humanize(topic.dimension))}</strong><p>${escapeHtml(topic.agent_instruction)}</p></div>`).join("")}
      </article>
    </section>

    <section>
      <h2>Redacted Candidate Evidence Ledger</h2>
      <div class="receipts">
        ${topItems.map((item) => `<details><summary>${escapeHtml(item.evidence_id)} \xB7 ${escapeHtml(item.source_alias)} \xB7 score ${item.retrieval_score.toFixed(2)}</summary><p><strong>Matched signals:</strong> ${escapeHtml(item.matched_signals.slice(0, 12).join(", ") || "none")}</p><pre>${escapeHtml(item.text_redacted)}</pre></details>`).join("")}
      </div>
    </section>

    <section>
      <h2>Master Records To Compare</h2>
      <div class="guardrails">
        ${masterRecordsToCompare().slice(0, 8).map((master) => `<article><span>${escapeHtml(master.display_name)}</span><p>${escapeHtml(master.profile_path)}</p><p>${escapeHtml(master.style_notes_path)}</p></article>`).join("")}
      </div>
    </section>

    <section class="section-grid">
      <article>
        <h2>Model Phase Checklist</h2>
        <p>The agent/LLM should read this evidence, split large ledgers across subagents if needed, create questions, then generate profile JSON and structured final content.</p>
        <ol>
          <li>Interpret full candidate ledger</li>
          <li>Create 2-5 interview questions</li>
          <li>Choose master lens by judgment</li>
          <li>Generate structured profile content for deterministic rendering</li>
        </ol>
      </article>
      <article>
        <h2>Local Evidence Initialized</h2>
        <dl>
          <div><dt>Memory file</dt><dd>InvestmentMirror.md</dd></div>
          <div><dt>Candidate spans</dt><dd>${evidenceItems.length}</dd></div>
          <div><dt>Active guardrails</dt><dd>model-owned</dd></div>
        </dl>
      </article>
    </section>

    <footer>Investment Mirror does not provide investment, legal, tax, or financial advice. It structures your reasoning; you remain responsible for your decisions.</footer>
  </main>
</body>
</html>`;
}
function renderDecisionHtml(review, outputDir) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Investment Mirror Decision Review</title>
  ${sharedReportCss()}
</head>
<body>
  <main class="page-shell">
    <section class="hero-grid compact">
      <div>
        <p class="kicker">Decision Review</p>
        <h1>${escapeHtml(review.asset_or_theme)}</h1>
        <p class="lead">${escapeHtml(review.profile_context)}</p>
        <div class="confidence"><span>Process status</span><strong>${escapeHtml(humanize(review.decision_status))}</strong></div>
      </div>
      ${review.closest_master_lens ? `<article class="master-card primary">${masterPortraitImg(review.closest_master_lens.master_id, review.closest_master_lens.display_name, outputDir)}<div><p class="label">Relevant master lens</p><h2>${escapeHtml(review.closest_master_lens.display_name)}</h2><p>${escapeHtml(review.closest_master_lens.why_match)}</p></div></article>` : `<article class="master-card primary"><div><p class="label">Standalone mode</p><h2>Generic thesis clarification</h2><p>Run /investment-profile-init to personalize guardrails.</p></div></article>`}
    </section>
    <section class="sheet">
      <h2>Decision Summary</h2>
      <p>${escapeHtml(review.user_thesis)}</p>
    </section>
    <section class="section-grid">
      <article>
        <h2>Thesis Decomposition</h2>
        <ol>${review.assumptions.map((assumption) => `<li>${escapeHtml(assumption)}</li>`).join("")}</ol>
      </article>
      <article>
        <h2>Guided Research Questions</h2>
        <ol>${review.research_questions.map((question) => `<li>${escapeHtml(question)}</li>`).join("")}</ol>
      </article>
    </section>
    <section>
      <h2>P0 / P1 / P2 Issues</h2>
      <div class="issues">${review.issues.map((issue) => `<article><span class="badge ${issue.severity.toLowerCase()}">${issue.severity}</span><h3>${escapeHtml(issue.title)}</h3><p>${escapeHtml(issue.why_it_matters)}</p><p><strong>Guardrail:</strong> ${escapeHtml(issue.triggered_guardrail ?? "none")}</p><p><strong>Pass condition:</strong> ${escapeHtml(issue.pass_condition)}</p></article>`).join("")}</div>
    </section>
    <section class="sheet">
      <h2>Decision Log Preview</h2>
      <p>Decision ID: ${escapeHtml(review.decision_id)}</p>
      <p>Status labels are process labels only. This artifact does not recommend buy, sell, or hold actions.</p>
    </section>
    <footer>Investment Mirror does not provide investment, legal, tax, or financial advice. It structures your reasoning; you remain responsible for your decisions.</footer>
  </main>
</body>
</html>`;
}
function renderProfileUpdateHtml(update, profile) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Investment Mirror Profile Update</title>${sharedReportCss()}</head><body><main class="page-shell"><section class="sheet"><p class="kicker">Profile Update</p><h1>${escapeHtml(profile.profile_id)}</h1><pre>${escapeHtml(JSON.stringify(update, null, 2))}</pre></section></main></body></html>`;
}
function sharedReportCss() {
  return `<style>
  :root { color-scheme: light; --ink:#201b17; --muted:#5f574f; --quiet:#6f665c; --line:#d7ccbd; --paper:#fbfaf6; --paper-2:#f4efe6; --sheet:#fffdf8; --copper:#ec5d24; --copper-dark:#8f3519; --soft:#efe4d7; --serif-cn:"Songti SC","Noto Serif CJK SC","Source Han Serif SC","STSong","Iowan Old Style",Georgia,serif; --sans-cn:"Avenir Next","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif; --mono:"SFMono-Regular","Cascadia Mono",Menlo,monospace; }
  * { box-sizing: border-box; }
  html { scroll-behavior:smooth; }
  body { margin:0; background:linear-gradient(90deg, rgba(32,27,23,.04) 1px, transparent 1px) 0 0 / 92px 92px, linear-gradient(180deg, rgba(32,27,23,.03) 1px, transparent 1px) 0 0 / 92px 92px, linear-gradient(180deg, rgba(255,255,255,.52) 0, rgba(255,255,255,.12) 360px, rgba(244,239,230,.86) 100%), var(--paper); color:var(--ink); font-family:var(--sans-cn); line-height:1.58; }
  .page-shell { position:relative; z-index:1; width:min(1080px, calc(100% - 44px)); margin:0 auto; padding:34px 0 64px; }
  a { color:var(--copper-dark); text-decoration:none; border-bottom:1px solid rgba(159,62,29,.26); }
  .candidate-banner { border:1px solid var(--copper); border-radius:8px; background:#fff8ef; padding:16px 18px; margin-bottom:22px; }
  .candidate-banner p:last-child { margin:0; color:var(--muted); }
  code { font-family:var(--mono); }
  .hero-grid { display:grid; grid-template-columns: 1.05fr .95fr; gap:32px; align-items:center; }
  .hero-grid.compact { min-height: 520px; }
  .kicker, .label { margin:0 0 14px; color:var(--copper-dark); font:700 13px/1.15 var(--mono); text-transform:uppercase; letter-spacing:.06em; }
  h1, h2, h3 { font-family:var(--serif-cn); font-weight:500; letter-spacing:0; text-wrap:balance; }
  h1 { margin:0; max-width:640px; font-size:clamp(34px, 3.4vw, 48px); line-height:1.05; }
  h2 { margin:0 0 18px; font-size:clamp(27px, 2.5vw, 38px); line-height:1.08; }
  h3 { margin:0 0 10px; font-size:24px; line-height:1.15; }
  p { margin:0 0 16px; }
  ul { margin:14px 0 0; padding-left:1.1em; }
  li { margin:8px 0; }
  .lead { max-width:62ch; color:var(--muted); font-size:20px; margin:24px 0; }
  .confidence { display:inline-flex; gap:16px; align-items:center; border-top:1px solid var(--ink); border-bottom:1px solid var(--line); padding:12px 0; min-width:280px; }
  .confidence span { color:var(--muted); }
  .confidence strong { font-family:var(--mono); }
  .master-card, .legacy-card, .issues article { background:rgba(255,253,248,.92); border:1px solid var(--line); border-radius:8px; }
  .master-card { display:grid; grid-template-columns: 170px 1fr; gap:22px; padding:20px; box-shadow: 0 24px 60px rgba(81, 51, 28, .09); transform: rotate(-1deg); }
  .master-card img { width:100%; border-radius:8px; border:1px solid var(--line); background:var(--soft); }
  .master-card a { color:var(--copper-dark); font-weight:700; text-decoration:none; }
  .hero-profile { grid-template-columns:clamp(260px, 30vw, 360px) minmax(0, 1fr); gap:min(5vw, 58px); min-height:0; padding:22px 0 30px; border-top:2px solid var(--ink); border-bottom:1px solid var(--ink); }
  .master-stamp { align-self:start; margin:0; }
  .master-stamp img { display:block; width:100%; aspect-ratio:220 / 260; object-fit:cover; background:#f8f5ef; border:1px solid var(--line); filter:saturate(.92) contrast(1.02); }
  .master-stamp figcaption { margin:13px 0 0; color:var(--quiet); font-size:15px; line-height:1.5; }
  .master-stamp b { display:block; margin:0 0 6px; color:var(--ink); font-family:var(--serif-cn); font-size:28px; font-weight:500; line-height:1.05; }
  .hero-copy { position:relative; }
  .hero-copy h1 { max-width:900px; }
  .decision-copy { max-width:72ch; color:var(--ink); font-family:var(--sans-cn); font-size:18px; line-height:1.68; margin:0 0 16px; }
  .decision-copy + .decision-copy { color:var(--muted); font-size:17px; }
  .decision-copy strong { color:var(--ink); font-weight:700; }
  .master-portrait-fallback { display:flex; align-items:center; justify-content:center; aspect-ratio:1; width:100%; border-radius:8px; border:1px dashed var(--line); background:var(--soft); color:var(--muted); }
  .master-detail .master-portrait-fallback { width:120px; }
  .master-portrait-fallback span { font-family:var(--mono); font-size:34px; letter-spacing:2px; }
  .section-heading { max-width:780px; margin:0 0 26px; display:block; }
  .section-heading p { color:var(--muted); font-size:17px; line-height:1.7; }
  .sheet { padding:0; background:transparent; border:0; border-radius:0; box-shadow:none; }
  .evidence-sheet { margin:36px 0 54px; padding-top:16px; border-top:1px solid var(--line); }
  .evidence-sheet h2 { font-size:clamp(24px, 2.5vw, 36px); }
  .metric-row { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:0; margin:16px 0 0; border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
  .metric-row div { display:block; padding:14px 18px 15px 0; border:0; }
  .metric-row div + div { border-left:1px solid var(--line); padding-left:18px; }
  dt { color:var(--quiet); font-size:13px; text-transform:uppercase; letter-spacing:.08em; }
  .metric-row dd { margin:6px 0 0; font:600 20px/1.1 var(--mono); color:var(--ink); }
  .evidence-table { width:100%; border-collapse:collapse; table-layout:fixed; margin-top:18px; }
  .evidence-table th, .evidence-table td { text-align:left; vertical-align:top; border-top:1px solid var(--line); padding:14px 12px; }
  .evidence-table th { color:var(--muted); font:700 12px/1.2 var(--mono); text-transform:uppercase; }
  .receipt-line { color:var(--muted); font-size:14px; }
  .receipt-line code { color:var(--ink); }
  .pattern-grid { display:block; margin:20px 0 72px; border-top:1px solid var(--ink); }
  .pattern-card { position:relative; display:grid; grid-template-columns:190px minmax(0, 1fr); gap:36px; min-height:0; padding:22px 0 24px; border:0; border-bottom:1px solid var(--line); border-radius:0; background:transparent; }
  .pattern-card span { display:block; color:var(--ink); font-family:var(--serif-cn); font-size:clamp(22px, 1.8vw, 27px); line-height:1.14; text-transform:none; margin:0; }
  .pattern-card small { display:block; margin-top:8px; color:var(--quiet); font:700 13px/1.2 var(--mono); letter-spacing:.04em; text-transform:uppercase; }
  .pattern-card p { grid-column:2; margin:0; color:var(--ink); font-family:var(--sans-cn); font-size:17px; line-height:1.72; max-width:72ch; }
  .pattern-card .evidence-signal { margin-top:10px; color:var(--muted); font-size:15px; line-height:1.58; }
  .pattern-card .evidence-signal b { color:var(--copper-dark); font:700 12px/1.2 var(--mono); letter-spacing:.06em; text-transform:uppercase; }
  .caveat { color:var(--muted); border-top:1px solid var(--line); padding-top:12px; }
  .cta-section { margin-top:10px; padding-top:24px; border-top:1px solid var(--ink); }
  .cta-section p { max-width:820px; color:var(--muted); }
  .report-stack { display:grid; grid-template-columns: 1fr 1.2fr; gap:24px; align-items:start; margin:42px 0; }
  .sheet.offset { margin-top:34px; }
  .master-detail { display:grid; grid-template-columns:120px 1fr; gap:18px; border-top:1px solid var(--line); padding-top:18px; margin-top:18px; }
  .master-detail img { width:120px; border:1px solid var(--line); border-radius:8px; }
  .master-detail h3 span { color:var(--copper-dark); font-family:var(--mono); font-size:15px; }
  .section-grid { display:block; max-width:900px; margin:20px 0 86px; padding-top:24px; border-top:1px solid var(--ink); }
  .section-grid > article { padding:0; background:transparent; border:0; border-radius:0; }
  .section-grid > article p, .section-grid > article dd, .section-grid > article li { color:var(--muted); }
  .section-grid > article > p:first-of-type { color:var(--ink); font-family:var(--serif-cn); font-size:23px; line-height:1.55; }
  .fingerprint-row { display:grid; grid-template-columns: 1fr 44px; gap:12px; align-items:center; border-top:1px solid var(--line); padding:11px 0; position:relative; }
  .fingerprint-row i { grid-column:1 / -1; display:block; height:3px; background:linear-gradient(90deg, var(--copper-dark) calc(var(--v) * 1%), transparent 0); border-bottom:1px solid var(--line); }
  .pattern, .receipts details { border-top:1px solid var(--line); padding:14px 0; }
  .guardrail-intro { max-width:800px; margin:-4px 0 22px; color:var(--muted); font-size:16px; line-height:1.64; }
  .guardrails { display:block; margin:18px 0 72px; border-top:1px solid var(--ink); border-bottom:1px solid var(--line); }
  .guardrails article { position:relative; display:grid; grid-template-columns:210px minmax(0, .86fr) minmax(260px, 1fr); gap:28px; min-height:0; padding:18px 0 20px; background:transparent; border:0; border-radius:0; border-top:1px solid var(--line); }
  .guardrails article:first-child { border-top:0; }
  .guardrails span { display:block; min-height:0; margin:0; padding:0; border:0; border-radius:0; color:var(--copper-dark); font:700 13px/1.25 var(--mono); text-transform:uppercase; letter-spacing:.08em; }
  .guardrails p { color:var(--muted); font-size:15px; line-height:1.55; }
  .guardrails ul { padding:0; margin:0; list-style:none; grid-column:3; }
  .guardrails li { color:var(--ink); font-family:var(--sans-cn); font-size:18px; font-weight:700; line-height:1.5; }
  .issues { display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:18px; }
  .issues article { padding:22px; }
  .badge { display:inline-block; border:1px solid var(--copper-dark); color:var(--copper-dark); padding:4px 8px; border-radius:6px; font:700 12px/1 var(--mono); margin-bottom:12px; }
  .badge.p0 { border-color:#9f2f2d; color:#9f2f2d; }
  .badge.p1 { border-color:#956400; color:#956400; }
  .badge.p2 { border-color:#1f6c9f; color:#1f6c9f; }
  dl div { display:flex; justify-content:space-between; border-top:1px solid var(--line); padding:12px 0; gap:20px; }
  dt { color:var(--muted); }
  footer { margin-top:42px; color:var(--muted); border-top:1px solid var(--line); padding-top:18px; font-size:14px; }
  pre { white-space:pre-wrap; overflow:auto; margin:24px 0 20px; background:rgba(255,250,240,.52); color:var(--ink); border-radius:0; padding:20px 0; border-top:1px solid var(--line); border-bottom:1px solid var(--line); font-size:14px; line-height:1.6; }
  @media (max-width: 1020px) { .hero-grid, .hero-profile, .section-heading, .section-grid, .pattern-card { grid-template-columns:1fr; } .master-stamp { width:min(320px, 64vw); } .pattern-card span, .pattern-card p { grid-column:auto; } .guardrails article { grid-template-columns:1fr; gap:8px; } .guardrails ul { grid-column:auto; } }
  @media (max-width: 720px) { .page-shell { width:min(100% - 24px, 1240px); padding-top:18px; } .hero-profile { min-height:auto; padding-bottom:36px; } .master-stamp { width:min(280px, 76vw); } h1 { font-size:36px; } .metric-row, .report-stack, .issues, .master-card, .master-detail { grid-template-columns:1fr; } .metric-row div + div { border-left:0; padding-left:0; border-top:1px solid var(--line); } .section-grid dl div { grid-template-columns:1fr; gap:6px; } .evidence-table { display:block; overflow-x:auto; } }
  </style>`;
}
function writeSqliteIndex(outputDir, sources, turns, spans, episodes) {
  const payload = join(outputDir, ".sqlite_payload.json");
  writeJson(payload, { sources, turns, spans, episodes, parserVersion, scoringVersion });
  const script = join(skillRoot, "scripts", "sqlite_bridge.py");
  const result = spawnSync("python3", [script, payload, join(outputDir, "source_index.sqlite")], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`sqlite bridge failed: ${result.stderr || result.stdout}`);
  }
  if (process.env.INVESTMENT_MIRROR_KEEP_SQLITE_PAYLOAD !== "1" && existsSync(payload)) {
    unlinkSync(payload);
  }
}
function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const id = key(item);
    groups[id] ??= [];
    groups[id].push(item);
    return groups;
  }, {});
}
function countBy(items) {
  return items.reduce((counts, item) => {
    counts[item] = (counts[item] ?? 0) + 1;
    return counts;
  }, {});
}
function sourceAlias(path) {
  const rel = relative(homedir(), path);
  return rel.startsWith("..") ? basename(path) : `~/${rel.split("/").slice(0, 5).join("/")}`;
}
function guardrailName(id) {
  return humanize(id.replace(/_before_.+$/, ""));
}
function humanize(id) {
  return id.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

// skills/investment-mirror/scripts/investment_mirror_cli.ts
function parseArgs(argv) {
  const [command = "help", ...rest] = argv;
  const parsed = { command, values: [], include: [], exclude: [], reindex: false, writeLog: false, provisional: false, declinedInterview: false };
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === "--output") parsed.output = rest[++index];
    else if (arg === "--include") parsed.include.push(rest[++index]);
    else if (arg === "--exclude") parsed.exclude.push(rest[++index]);
    else if (arg === "--reindex") parsed.reindex = true;
    else if (arg === "--write-log" || arg === "--write") parsed.writeLog = true;
    else if (arg === "--since") parsed.since = rest[++index];
    else if (arg === "--synthesis") parsed.synthesis = rest[++index];
    else if (arg === "--content") parsed.content = rest[++index];
    else if (arg === "--html") parsed.html = rest[++index];
    else if (arg === "--questions") parsed.questions = rest[++index];
    else if (arg === "--answers-summary") parsed.answersSummary = rest[++index];
    else if (arg === "--provisional") parsed.provisional = true;
    else if (arg === "--declined-interview") parsed.declinedInterview = true;
    else parsed.values.push(arg);
  }
  return parsed;
}
function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}
`);
}
function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.command === "help" || args.command === "--help") {
    process.stdout.write(`Investment Mirror v0.2

Commands:
  profile-init [--output PATH] [--include PATH] [--exclude PATH] [--reindex]
  profile-update [--output PATH] [--include PATH] [--exclude PATH] [--since 30d]
  profile-finalize --synthesis PATH --questions PATH --answers-summary TEXT --content PATH [--provisional] [--output PATH]
  decision "thesis text" [--output PATH] [--write-log]
  mirror-ask "question" [--output PATH]
  discover-sources [--output PATH] [--include PATH] [--exclude PATH]
`);
    return;
  }
  if (args.command === "discover-sources") {
    const sources = discoverSources({ output: args.output, include: args.include, exclude: args.exclude, reindex: args.reindex });
    if (args.output) buildSourceManifest(sources, args.output);
    print({
      source_count: sources.length,
      by_type: countBy2(sources.map((source) => source.source_type)),
      by_status: countBy2(sources.map((source) => source.status)),
      manifest_written: args.output ? existsSync2(args.output) : false,
      sources: sources.slice(0, 50)
    });
    return;
  }
  if (args.command === "profile-init" || args.command === "investment-profile-init") {
    const result = generateInvestorProfile({ output: args.output, include: args.include, exclude: args.exclude, reindex: args.reindex, since: args.since });
    print({
      candidate_inputs_path: `${result.outputDir}/${result.profile.candidate_profile_inputs_path ?? "profile_candidate_inputs.json"}`,
      synthesis_mode: result.profile.synthesis_mode,
      llm_required: result.profile.llm_required,
      evidence_path: `${result.outputDir}/${result.profile.profile_evidence_path ?? "profile_evidence.json"}`,
      synthesis_prompt_path: `${result.outputDir}/${result.profile.profile_synthesis_prompt_path ?? "profile_synthesis_prompt.md"}`,
      finalization_schema_path: `${result.outputDir}/${result.profile.profile_finalization_schema_path ?? "profile_finalization_schema.json"}`,
      report_template_path: `${result.outputDir}/${result.profile.profile_report_template_path ?? "profile_report_template.html"}`,
      candidate_report_path: `${result.outputDir}/${result.profile.candidate_report_html_path ?? "profile_candidate_report.html"}`,
      final_profile_path_pending: `${result.outputDir}/profile.json`,
      final_rendered_html_path_pending: `${result.outputDir}/${result.profile.final_rendered_html_path ?? result.profile.final_model_html_path ?? "profile.html"}`,
      guardrails_path: `${result.outputDir}/guardrails.yaml`,
      prompt_pack_path: `${result.outputDir}/prompt_pack.md`,
      source_index_path: `${result.outputDir}/source_index.sqlite`,
      source_count: result.sources.length,
      candidate_spans_found: result.profile.source_summary.candidate_spans_found ?? 0,
      deterministic_profile_judgments: false,
      model_review_required: result.profile.source_summary.model_review_required ?? true,
      required_interview_questions: result.profile.interview_question_count ?? { min: 2, max: 5 },
      calibration_question_topics: result.profile.calibration_question_topics ?? [],
      presentation_next_steps: result.profile.presentation_next_steps ?? []
    });
    return;
  }
  if (args.command === "profile-update" || args.command === "investment-profile-update") {
    const result = profileUpdate({ output: args.output, include: args.include, exclude: args.exclude, reindex: args.reindex, since: args.since });
    print({
      candidate_inputs_path: `${result.outputDir}/${result.profile.candidate_profile_inputs_path ?? "profile_candidate_inputs.json"}`,
      candidate_report_path: `${result.outputDir}/${result.profile.candidate_report_html_path ?? "profile_candidate_report.html"}`,
      final_profile_preserved: result.update.final_profile_preserved,
      update: result.update
    });
    return;
  }
  if (args.command === "profile-finalize" || args.command === "investment-profile-finalize") {
    const result = finalizeProfile({
      output: args.output,
      synthesizedProfilePath: args.synthesis,
      finalContentPath: args.content,
      finalHtmlPath: args.html,
      questionsPath: args.questions,
      answersSummary: args.answersSummary,
      provisional: args.provisional,
      declinedInterview: args.declinedInterview
    });
    print({
      profile_path: `${result.outputDir}/profile.json`,
      html_path: `${result.outputDir}/profile.html`,
      profile_state: result.profile.profile_state,
      synthesis_mode: result.profile.synthesis_mode,
      provisional: result.profile.provisional,
      unknown_dimensions: result.profile.unknown_dimensions
    });
    return;
  }
  if (args.command === "decision" || args.command === "investment-decision") {
    const thesis = args.values.join(" ").trim();
    if (!thesis) throw new Error("Missing thesis text for investment decision.");
    const review = lintInvestmentDecision({ output: args.output, thesis, writeLog: args.writeLog });
    print({
      decision_id: review.decision_id,
      mode: review.mode,
      process_status: review.decision_status,
      p0_count: review.issues.filter((issue) => issue.severity === "P0").length,
      p1_count: review.issues.filter((issue) => issue.severity === "P1").length,
      p2_count: review.issues.filter((issue) => issue.severity === "P2").length,
      artifact_paths: review.artifact_paths,
      research_questions: review.research_questions
    });
    return;
  }
  if (args.command === "mirror-ask" || args.command === "investment-mirror-ask") {
    const question = args.values.join(" ").trim();
    if (!question) throw new Error("Missing question for Investment Mirror memory.");
    print(mirrorAsk(question, args.output));
    return;
  }
  throw new Error(`Unknown command: ${args.command}`);
}
function countBy2(values) {
  return values.reduce((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}
main();
export {
  main
};
