// roundRect / ellipse ポリフィル
if(!CanvasRenderingContext2D.prototype.roundRect){
  CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
    const m=Math.min(w,h); if(r>m/2) r=m/2;
    this.beginPath(); this.moveTo(x+r,y);
    this.arcTo(x+w,y,  x+w,y+h,r);
    this.arcTo(x+w,y+h,x,  y+h,r);
    this.arcTo(x,  y+h,x,  y,  r);
    this.arcTo(x,  y,  x+w,y,  r);
    this.closePath(); return this;
  };
}
if(!CanvasRenderingContext2D.prototype.ellipse){
  CanvasRenderingContext2D.prototype.ellipse=function(x,y,rx,ry,rot,s,e,ccw){
    this.save(); this.translate(x,y); this.rotate(rot||0); this.scale(rx,ry);
    this.beginPath(); this.arc(0,0,1,s||0,e||Math.PI*2,!!ccw); this.restore();
  };
}
