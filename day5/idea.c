//alien mainframe - maybe use on jan 8?
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = 2.*fragCoord/iResolution.xy-1.;
    uv+=sin(iTime/10.*round(uv*50.));
    fragColor=vec4(sign(vec3(.5,.5,1.)-abs(length(uv)*6.28-mod(atan(uv.x,uv.y)+6.28+iTime-vec3(.5,.25,0.),6.28))),1.);
}

// vaporwave glass
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = 2.*fragCoord/iResolution.xy-1.;
    float x=2.;
    uv+=sin(iTime/10.*round(uv*x)/x);
    float r = length(uv);
    float theta = mod(atan(uv.y,uv.x)+iTime+6.28,6.28)/6.28;
    vec3 c = vec3(r,mod(r,theta*(.5*sin(iTime/10.)+1.)),theta);
    //c.rg -= sin(iTime * round(uv*x)/x)*cos(iTime);
    fragColor=vec4(c,1.);
}

//vaporwave stained glass
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = 2.*fragCoord/iResolution.xy-1.;
    float x=2.;
    uv+=sin(iTime/10.*round(uv*x)/x);
    float r = length(uv);
    float theta = mod(atan(uv.y,uv.x)+iTime+6.28,6.28)/6.28;
    vec3 c = vec3(r,mod(r,theta*(.5*sin(iTime/10.)+1.)),theta);
    c.rg -= sin(iTime * round(uv*x)/x)*cos(iTime);
    fragColor=vec4(c,1.);
}

//curve -- maybe use on jan 25?
void mainImage(out vec4 fragColor,in vec2 fragCoord){
vec2 c=(40.*clamp(sin(iTime/2.),0.,.5)+2.)*(fragCoord-iResolution.xy/2.)/max(iResolution.x,iResolution.y);
vec2 i=2.*floor((c+1.)/2.);
c-=i;
float o = atan(c.y,c.x);
float t=.25+abs(cos(iTime+o/2.+i.x+i.y))*(sin((10.+i.x-i.y)*o)+.75)/10.;
fragColor = sqrt(vec4((1.-smoothstep(0.,.025,abs(length(c)-t)))*vec3(t,sin(o-.5),(o+3.14)/6.28), 1.));}

