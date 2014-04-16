uniform sampler2D u_depthTexture;

uniform vec3 u_point;
uniform vec3 u_normal;

varying vec2 v_textureCoordinates;

czm_ray createRay()
{
    czm_ray ray;
    ray.origin = vec3(0.0);
    ray.direction = normalize(czm_windowToEyeCoordinates(gl_FragCoord).xyz);
    
    return ray;
}

float getRayPlaneIntersection(czm_ray ray, vec3 normal, float dist)
{
	vec3 origin = ray.origin;
    vec3 direction = ray.direction;
    float denominator = dot(normal, direction);

    if (abs(denominator) < czm_epsilon7) {
        // Ray is parallel to plane.
        return -1.0;
    }

    return (-dist - dot(normal, origin)) / denominator;
}

void main()
{
    vec3 pointEC = (czm_view * vec4(u_point, 1.0)).xyz;
    vec3 normalEC = czm_normal3D * u_normal;
    float dist = -dot(normalEC, pointEC);
    
    czm_ray ray = createRay();
    float t = getRayPlaneIntersection(ray, normalEC, dist);
    
    if (t < 0.0)
    {
        discard;
    }
    
    czm_ellipsoid ellipsoid = czm_getWgs84EllipsoidEC();
    czm_raySegment segment = czm_rayEllipsoidIntersectionInterval(ray, ellipsoid);
    if (!czm_isEmpty(segment) && segment.start < t)
    {
        discard;
    }
    
    vec3 intersectionPoint = ray.origin + t * ray.direction;
    float depth = czm_eyeToWindowCoordinates(vec4(intersectionPoint, 1.0)).z;
    if (depth > texture2D(u_depthTexture, v_textureCoordinates).r)
    {
        discard;
    }
    
    vec3 positionWC = czm_inverseView * intersectionPoint;
    
    gl_FragColor = vec4(0.0, 1.0, 1.0, 0.5);
}