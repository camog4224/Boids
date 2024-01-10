let canvas = document.getElementById("myCanvas");
const Width = canvas.width;
const Height = canvas.height;

let ctx = canvas.getContext("2d");

let aSlider = document.getElementById("align");
let sSlider = document.getElementById("seperate");
let cSlider = document.getElementById("cohes");
let accSlider = document.getElementById("accel");
let percSlider = document.getElementById("rangeRange");

let percChecked = document.getElementById("rangeCheck");
let treeChecked = document.getElementById("qTree");

function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

function clearGraph(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
}

function drawCirc(x,y,r,c){
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
}

function drawSRect(x,y, w, h, c){
    ctx.lineWidth = 1;
    ctx.strokeStyle = c;
    ctx.strokeRect(x, y, w, h);
}
  
function drawLin(x1,y1,x2,y2,c,w){
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
  
function drawTex(x,y,text,c){
    ctx.font = "12px Georgia";
    ctx.fillStyle = "#000000";
    ctx.fillText(text, x, y);
}

class Vector{
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.length = this.mag();
    }

    rotateTo(angle){
        this.x = Math.cos(angle)*this.length;
        this.y = Math.sin(angle)*this.length;
    }

    rotateBy(angle){
        this.x = Math.cos(angle)*this.length;
        this.y = Math.sin(angle)*this.length;
    }

    add(v){
        this.x = this.x + v.x;
        this.y = this.y + v.y;
        this.length = this.mag();
    }

    mag(){
        return Math.sqrt(this.x**2 + this.y**2);
    }

    setMag(len){
        this.x = this.x*len/this.length;
        this.y = this.y*len/this.length;
        if(this.length == 0){
            
        }
        this.length = len;
    }

    multMag(len){
        this.x = this.x*len
        this.y = this.y*len;
        this.length = this.length*len;
    }

    copy(){
        return new Vector(this.x, this.y);
    }

    normal(){
        return new Vector(this.x/this.length, this.y/this.length);
    }

}

function subV(final, initial){
    return new Vector(final.x-initial.x, final.y-initial.y);
}

function addV(i, f){
    return new Vector(i.x + f.x, i.y + f.y);
}

class Segment{
    constructor() {
    }

    init2Pos(pos1, pos2, width){
        this.pos1 = pos1;
        this.pos2 = pos2;
        this.dir = subV(pos2, pos1);
        
        this.length = this.dir.mag();
        this.width = width;
        this.angle = Math.atan2(this.dir.y,this.dir.x);
        return this;
    }

    initDir(pos1, dir, width){
        this.pos1 = pos1;
        this.dir = dir;
        this.pos2 = addV(pos1, dir);
        
        this.width = width;
        this.angle = Math.atan2(this.dir.y,this.dir.x);
        this.length = dir.mag();
        return this;
    }

    initAng(pos1, length, angle, width){
        this.pos1 = pos1;
        this.dir = new Vector(Math.cos(angle)*length, Math.sin(angle)*length);
        this.pos2 = addV(pos1, this.dir);
        
        this.length = length;
        this.angle = angle;
        this.width = width;
        return this;
    }

    rotate(angle){
        this.dir.rotateTo(angle);
        this.angle = Math.atan2(this.dir.y,this.dir.x);
        this.pos2 = addV(this.pos1, this.dir);
    }

    moveT(endPos){
        this.pos1 = endPos;
        this.pos2 = addV(this.pos1, this.dir);
    }
    moveH(endPos){
        this.pos2 = endPos;
        this.pos1 = subV(this.pos2, this.dir);
    }

    follow(targetPos){
        let temp = subV(targetPos, this.pos1);
        let angle = Math.atan2(temp.y,temp.x);
        this.rotate(angle);

        this.moveH(targetPos);
    }

    draw(){
        
        drawLin(this.pos1.x, this.pos1.y, this.pos2.x, this.pos2.y, "#000000", this.width);
        // drawCirc(this.pos1.x, this.pos1.y, 5, "#000000");
        // drawCirc(this.pos2.x, this.pos2.y, 5, "#000000");
    }
}

class Appendage{
    constructor(numSegs, id){
        this.segments = [];
        this.velocity = new Vector(Math.random()*2 -1,Math.random()*2 - 1);
        this.velocity.multMag(3);
        this.acceleration = new Vector(0,0);
        let segLen = 10;
        this.fullLen = numSegs*segLen*1.3;
        this.id = id;
        for(let i = 0; i < numSegs; i++){
            let x = .1 * Width + Math.random() * Width * .8;
            // let x = Width/2;
            let y = .1 * Height + Math.random() * Height * .8;
            // let y = Height/2;
            let posT = new Vector(x,y);
            let posH = new Vector(x + segLen ,y + segLen);
            this.segments.push(new Segment().init2Pos(posT, posH, i/2+2));
        }
        this.head = this.segments[this.segments.length-1];
        
    }

    collision(){
        let end = this.segments[this.segments.length-1];
        if(end.pos2.x > Width + this.fullLen){
            end.moveH(new Vector(-this.fullLen, end.pos2.y));
            
        }else if(end.pos2.x < -this.fullLen){
            // end.moveH(new Vector(Width+this.fullLen, end.pos2.y));
            end.moveH(new Vector(Width + this.fullLen, end.pos2.y));
            
        }
        
        if(end.pos2.y > Height+this.fullLen){
            end.moveH(new Vector(end.pos2.x, -this.fullLen));
            
        }else if(end.pos2.y < -this.fullLen){
            end.moveH(new Vector(end.pos2.x, Height+this.fullLen));
            
        }
    }

    applyForce(force){
        let maxAccel = accSlider.value/7;
        
        this.acceleration = addV(this.acceleration, force);
        if(this.acceleration.length > maxAccel){
            this.acceleration.setMag(maxAccel);
        }
    }

    trail(){
        let maxSpeed = 30;
        let minSpeed = 10;
        this.velocity = addV(this.velocity, this.acceleration);
        if(this.velocity.length > maxSpeed){
            this.velocity.setMag(maxSpeed);
        }else if(this.velocity.length < minSpeed){
            this.velocity.setMag(minSpeed);
        }
        let nextPos = addV(this.segments[this.segments.length-1].pos2, this.velocity);
        this.follow(nextPos);

    }

    follow(targetPos){
        let pos = targetPos;
        for(let i = this.segments.length-1; i >= 0; i--){
            this.segments[i].follow(pos);
            pos = this.segments[i].pos1.copy();
        }
    }

    draw(){
        //redudant since joints for each segment are drawn twice
        //also change all segments[segments.length-1] with .head
        
        for(let i = 0; i < this.segments.length; i++){
            this.segments[i].draw();
        }
    }

    update(){
        this.collision();
        this.trail();
        this.draw();
    }
}

class Fleet{
    constructor(numAgents, numSegs){
        this.Apps = [];
        for(let i = 0; i < numAgents; i++){
            this.Apps.push(new Appendage(numSegs, i));
        }
    }

    returnPoints(){
        let els = [];
        for(let i = 0; i < this.Apps.length; i++){
            els.push(this.Apps[i].head.pos2);
        }
        return els;
    }

    flock(){
        for(let i = 0; i < this.Apps.length; i++){
            let curApp = this.Apps[i];
            let nearbyApps = this.getNearby(curApp);
            if(nearbyApps.length == 0){
                continue;
            }
            
            let avPos = new Vector(0,0);
            let avDir = new Vector(0,0);
            let avDir1 = new Vector(0,0);

            for(let j = 0; j < nearbyApps.length; j++){
                let tempApp = nearbyApps[j];
                
                avPos.add(tempApp.head.pos2);//cohesion
                let connect = subV(curApp.head.pos2, tempApp.head.pos2);
                connect.multMag(1/connect.length);
                avDir.add(connect);//seperation
                avDir1.add(tempApp.head.dir.normal());//align
            }

            let totalForce = new Vector(0,0);
            // avDir.rotateBy(Math.PI);
            // if(avDir.length == 0){
            
            // }else{
            avDir.multMag(sSlider.value/10);
            let sepSteer = subV(avDir, curApp.velocity);
            // }
            
            let drawAvDir = addV(curApp.head.pos2, avDir);
            // drawLin(curApp.head.pos2.x, curApp.head.pos2.y, drawAvDir.x, drawAvDir.y, "#990000", 1);
            
            totalForce.add(sepSteer)
            
            avPos.multMag(1/nearbyApps.length);
            
            let coh = subV(avPos, curApp.head.pos2);
            coh.multMag(cSlider.value/10);
            let cohSteer = subV(coh, curApp.velocity)
            
            let drawCoh = addV(curApp.head.pos2, coh);
            // drawLin(curApp.head.pos2.x, curApp.head.pos2.y, drawCoh.x, drawCoh.y,"#009900", 1);

            totalForce.add(cohSteer)

            avDir1 = avDir1.normal();
            let temp = curApp.velocity.normal();// maybe change to dir
            let align = subV(avDir1,temp);

            align.multMag(aSlider.value/10);

            let alignSteer = subV(align, curApp.velocity)
            let drawAlign = addV(curApp.head.pos2, align);
            // drawLin(curApp.head.pos2.x, curApp.head.pos2.y, drawAlign.x, drawAlign.y,"#000099", 1);
            
            totalForce.add(alignSteer)
            
            curApp.applyForce(totalForce);
        }
    }

    getNearby(app){
        let nearby = [];
        let range = percSlider.value*4;
        
        
        let tempRoot = root.search(app.head.pos2);
        if(tempRoot == null){
            return [];
        }
        // drawSRect(tempRoot.corner.x, tempRoot.corner.y, tempRoot.width, tempRoot.height, "#00ff00");
        // console.log(tempRoot);
        let pos = new Vector(app.head.pos2.x - range, app.head.pos2.y - range);
        if(percChecked.checked){
            drawSRect(pos.x, pos.y, 2*range, 2*range, "#0000ff");
        }
        
        let nearbyPossibleApps = tempRoot.getCloseby(pos, 2*range, 2*range);
        // console.log(nearbyPossibleApps.length);
        
        // for(let i = 0; i < this.Apps.length; i++){
        for(let i = 0; i < nearbyPossibleApps.length; i++){
            // let tempApp = this.Apps[i];
            let tempApp = nearbyPossibleApps[i];
            if(tempApp.id == app.id){
                continue;
            }
            let dist = subV(app.segments[app.segments.length-1].pos2, tempApp.segments[tempApp.segments.length-1].pos2).length;
            if(dist < range){
                nearby.push(tempApp);
            }
            
        }
        return nearby;
    }

    update(){
        this.flock();
        for(let i = 0; i < this.Apps.length; i++){
            let a = this.Apps[i];
            a.update();
        }
    }
}

function pInsideSquare(p, corner, w, h){
    return !(
        p.x > corner.x + w ||
        p.x < corner.x ||
        p.y > corner.y + h ||
        p.y < corner.y
    );
}

class Quad{
    constructor(par, index, els){
        if(par == "root"){
            this.parent = null;
            this.corner = new Vector(0,0);
            this.width = Width;
            this.height = Height;
        }else{
            this.parent = par;
            this.width = par.width/2;
            this.height = par.height/2;
            let x = (index%2)*this.width;
            let y = (Math.floor(index/2))*this.height;
            
            let newX = par.corner.x + x;
            let newY = par.corner.y + y;
            this.corner = new Vector(newX, newY);
        }
        this.elements = els;
        this.kids = [];
        if(this.elements.length > 1){
            this.allocate();
        }
    }


    //returns smallest quad tree with point in it
    search(p){
        if(this.checkInside(p) == false){
            return null;
        }
        if(this.elements.length == 1){
            
            return this;
        }
        for(let i = 0; i < this.kids.length; i++){
            if(this.kids[i].checkInside(p) == true){
                return this.kids[i].search(p);
            }
        }
    }

    draw(){
        drawSRect(this.corner.x, this.corner.y, this.width, this.height, "#000000");
        for(let i = 0; i < this.kids.length; i++){
            this.kids[i].draw();
        }
    }

    allocate(){
        let els = [[],[],[],[]];
        for(let i = 0; i < this.elements.length; i++){
            for(let j = 0; j < 4; j++){

                if(this.checkInsideSub(j, this.elements[i].head.pos2) == true){
                    els[j].push(this.elements[i]);
                    break;
                }
            }
        }
        for(let i = 0; i < 4; i++){
            this.kids.push(new Quad(this, i, els[i]));
        }
    }

    checkInside(p){
        return (
        p.x > this.corner.x && 
        p.x < this.corner.x + this.width && 
        p.y > this.corner.y && 
        p.y < this.corner.y + this.height);
    }

    checkInsideSub(i, p){
        let x = this.corner.x + (i%2)*this.width/2;
        let y = this.corner.y + Math.floor(i/2)*this.height/2;
        return (p.x > x && 
        p.x < x + this.width/2 && 
        p.y > y && 
        p.y < y + this.height/2);
    }
    //if square intersects this quad
    intersect(pos, w, h){
        return !(
        this.corner.x > pos.x + w || 
        this.corner.x + this.width < pos.x ||
        this.corner.y > pos.y + h ||
        this.corner.y + this.height < pos.y
        );
    }
    //if rect is completely within quad
    totallyWithin(corner, w, h){
        return(
            corner.x > this.corner.x &&
            corner.x + w < this.corner.x + this.width &&
            corner.y > this.corner.y &&
            corner.y + h < this.corner.y + this.height
        );
    }

    getCloseby(pos, w, h){
        // let found = [];
        if(!this.intersect(pos, w, h)){
            // return found;
            // console.log("out");
            return [];
        }
        //also check if range goes past borders
        if(this.totallyWithin(pos, w, h) == false){
            if(this.parent == null){
                // console.log("hit top");
                // console.log(this.elements.length);
                return this.elements;
            }
            // console.log("move up");
            return this.parent.getCloseby(pos, w, h);
        }else{
            // console.log("score");
            return this.elements;
        }
    }
}

setInterval(updateSeg, 100);
// canvas.addEventListener("mousemove", updateSeg);

let f = new Fleet(300, 5);

let root = new Quad("root", null, f.Apps);

let count = 0;

function updateSeg(evt){
    // let a = getMousePos(canvas, evt);
    
    // segs.follow(new Vector(a.x, a.y));
    clearGraph();
    root = new Quad("root", null, f.Apps);
    if(treeChecked.checked){
        root.draw();
    }
    f.update();
    count += 1;
    if(count%10 == 0){
        console.log(count, performance.now()-count*100);
    }
}
