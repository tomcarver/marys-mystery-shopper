!function(root,factory){if("object"==typeof exports&&exports)factory(exports);else{var mustache={};factory(mustache),"function"==typeof define&&define.amd?define(mustache):root.Mustache=mustache}}(this,function(mustache){function testRegExp(re,string){return RegExp_test.call(re,string)}function isWhitespace(string){return!testRegExp(nonSpaceRe,string)}function isFunction(object){return"function"==typeof object}function escapeRegExp(string){return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")}function escapeHtml(string){return String(string).replace(/[&<>"'\/]/g,function(s){return entityMap[s]})}function Scanner(string){this.string=string,this.tail=string,this.pos=0}function Context(view,parent){this.view=null==view?{}:view,this.parent=parent,this._cache={".":this.view}}function Writer(){this.clearCache()}function renderTokens(tokens,writer,context,template){function subRender(template){return writer.render(template,context)}for(var token,tokenValue,value,buffer="",i=0,len=tokens.length;len>i;++i)switch(token=tokens[i],tokenValue=token[1],token[0]){case"#":if(value=context.lookup(tokenValue),"object"==typeof value||"string"==typeof value)if(isArray(value))for(var j=0,jlen=value.length;jlen>j;++j)buffer+=renderTokens(token[4],writer,context.push(value[j]),template);else value&&(buffer+=renderTokens(token[4],writer,context.push(value),template));else if(isFunction(value)){var text=null==template?null:template.slice(token[3],token[5]);value=value.call(context.view,text,subRender),null!=value&&(buffer+=value)}else value&&(buffer+=renderTokens(token[4],writer,context,template));break;case"^":value=context.lookup(tokenValue),(!value||isArray(value)&&0===value.length)&&(buffer+=renderTokens(token[4],writer,context,template));break;case">":value=writer.getPartial(tokenValue),isFunction(value)&&(buffer+=value(context));break;case"&":value=context.lookup(tokenValue),null!=value&&(buffer+=value);break;case"name":value=context.lookup(tokenValue),null!=value&&(buffer+=mustache.escape(value));break;case"text":buffer+=tokenValue}return buffer}function nestTokens(tokens){for(var token,tree=[],collector=tree,sections=[],i=0,len=tokens.length;len>i;++i)switch(token=tokens[i],token[0]){case"#":case"^":sections.push(token),collector.push(token),collector=token[4]=[];break;case"/":var section=sections.pop();section[5]=token[2],collector=sections.length>0?sections[sections.length-1][4]:tree;break;default:collector.push(token)}return tree}function squashTokens(tokens){for(var token,lastToken,squashedTokens=[],i=0,len=tokens.length;len>i;++i)token=tokens[i],token&&("text"===token[0]&&lastToken&&"text"===lastToken[0]?(lastToken[1]+=token[1],lastToken[3]=token[3]):(lastToken=token,squashedTokens.push(token)));return squashedTokens}function escapeTags(tags){return[new RegExp(escapeRegExp(tags[0])+"\\s*"),new RegExp("\\s*"+escapeRegExp(tags[1]))]}function parseTemplate(template,tags){function stripSpace(){if(hasTag&&!nonSpace)for(;spaces.length;)delete tokens[spaces.pop()];else spaces=[];hasTag=!1,nonSpace=!1}if(template=template||"",tags=tags||mustache.tags,"string"==typeof tags&&(tags=tags.split(spaceRe)),2!==tags.length)throw new Error("Invalid tags: "+tags.join(", "));for(var start,type,value,chr,token,openSection,tagRes=escapeTags(tags),scanner=new Scanner(template),sections=[],tokens=[],spaces=[],hasTag=!1,nonSpace=!1;!scanner.eos();){if(start=scanner.pos,value=scanner.scanUntil(tagRes[0]))for(var i=0,len=value.length;len>i;++i)chr=value.charAt(i),isWhitespace(chr)?spaces.push(tokens.length):nonSpace=!0,tokens.push(["text",chr,start,start+1]),start+=1,"\n"==chr&&stripSpace();if(!scanner.scan(tagRes[0]))break;if(hasTag=!0,type=scanner.scan(tagRe)||"name",scanner.scan(whiteRe),"="===type?(value=scanner.scanUntil(eqRe),scanner.scan(eqRe),scanner.scanUntil(tagRes[1])):"{"===type?(value=scanner.scanUntil(new RegExp("\\s*"+escapeRegExp("}"+tags[1]))),scanner.scan(curlyRe),scanner.scanUntil(tagRes[1]),type="&"):value=scanner.scanUntil(tagRes[1]),!scanner.scan(tagRes[1]))throw new Error("Unclosed tag at "+scanner.pos);if(token=[type,value,start,scanner.pos],tokens.push(token),"#"===type||"^"===type)sections.push(token);else if("/"===type){if(openSection=sections.pop(),!openSection)throw new Error('Unopened section "'+value+'" at '+start);if(openSection[1]!==value)throw new Error('Unclosed section "'+openSection[1]+'" at '+start)}else if("name"===type||"{"===type||"&"===type)nonSpace=!0;else if("="===type){if(tags=value.split(spaceRe),2!==tags.length)throw new Error("Invalid tags at "+start+": "+tags.join(", "));tagRes=escapeTags(tags)}}if(openSection=sections.pop())throw new Error('Unclosed section "'+openSection[1]+'" at '+scanner.pos);return nestTokens(squashTokens(tokens))}var whiteRe=/\s*/,spaceRe=/\s+/,nonSpaceRe=/\S/,eqRe=/\s*=/,curlyRe=/\s*\}/,tagRe=/#|\^|\/|>|\{|&|=|!/,RegExp_test=RegExp.prototype.test,Object_toString=Object.prototype.toString,isArray=Array.isArray||function(object){return"[object Array]"===Object_toString.call(object)},entityMap={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;"};Scanner.prototype.eos=function(){return""===this.tail},Scanner.prototype.scan=function(re){var match=this.tail.match(re);if(match&&0===match.index){var string=match[0];return this.tail=this.tail.substring(string.length),this.pos+=string.length,string}return""},Scanner.prototype.scanUntil=function(re){var match,index=this.tail.search(re);switch(index){case-1:match=this.tail,this.tail="";break;case 0:match="";break;default:match=this.tail.substring(0,index),this.tail=this.tail.substring(index)}return this.pos+=match.length,match},Context.make=function(view){return view instanceof Context?view:new Context(view)},Context.prototype.push=function(view){return new Context(view,this)},Context.prototype.lookup=function(name){var value;if(name in this._cache)value=this._cache[name];else{for(var context=this;context;){if(name.indexOf(".")>0){value=context.view;for(var names=name.split("."),i=0;null!=value&&i<names.length;)value=value[names[i++]]}else value=context.view[name];if(null!=value)break;context=context.parent}this._cache[name]=value}return isFunction(value)&&(value=value.call(this.view)),value},Writer.prototype.clearCache=function(){this._cache={},this._partialCache={}},Writer.prototype.compile=function(template,tags){var fn=this._cache[template];if(!fn){var tokens=mustache.parse(template,tags);fn=this._cache[template]=this.compileTokens(tokens,template)}return fn},Writer.prototype.compilePartial=function(name,template,tags){var fn=this.compile(template,tags);return this._partialCache[name]=fn,fn},Writer.prototype.getPartial=function(name){return name in this._partialCache||!this._loadPartial||this.compilePartial(name,this._loadPartial(name)),this._partialCache[name]},Writer.prototype.compileTokens=function(tokens,template){var self=this;return function(view,partials){if(partials)if(isFunction(partials))self._loadPartial=partials;else for(var name in partials)self.compilePartial(name,partials[name]);return renderTokens(tokens,self,Context.make(view),template)}},Writer.prototype.render=function(template,view,partials){return this.compile(template)(view,partials)},mustache.name="mustache.js",mustache.version="0.7.3",mustache.tags=["{{","}}"],mustache.Scanner=Scanner,mustache.Context=Context,mustache.Writer=Writer,mustache.parse=parseTemplate,mustache.escape=escapeHtml;var defaultWriter=new Writer;mustache.clearCache=function(){return defaultWriter.clearCache()},mustache.compile=function(template,tags){return defaultWriter.compile(template,tags)},mustache.compilePartial=function(name,template,tags){return defaultWriter.compilePartial(name,template,tags)},mustache.compileTokens=function(tokens,template){return defaultWriter.compileTokens(tokens,template)},mustache.render=function(template,view,partials){return defaultWriter.render(template,view,partials)},mustache.to_html=function(template,view,partials,send){var result=mustache.render(template,view,partials);return isFunction(send)?void send(result):result}});