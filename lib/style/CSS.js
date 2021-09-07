Figma.CSS = function (){
    
    this.colorString = function (color) {
        return `rgba(${Math.round(color.r*255)}, ${Math.round(color.g*255)}, ${Math.round(color.b*255)}, ${color.a})`;
    },

    this.dropShadow = function (effect) {
        return `${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${colorString(effect.color)}`;
    },

    this.innerShadow = function (effect) {
        return `inset ${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${colorString(effect.color)}`;
    },

    this.backgroundSize = function (scaleMode) {
        if (scaleMode === 'FILL') {
            return 'cover';
        }
    },

    this.getPaint = function (paintList) {
        if (paintList && paintList.length > 0) {
            return paintList[paintList.length - 1];
        }

        return null;
    },

    this.paintToLinearGradient = function (paint) {
        const handles = paint.gradientHandlePositions;
        const handle0 = handles[0];
        const handle1 = handles[1];

        const ydiff = handle1.y - handle0.y;
        const xdiff = handle0.x - handle1.x;

        const angle = Math.atan2(-xdiff, -ydiff);
        const stops = paint.gradientStops.map((stop) => {
            return `${colorString(stop.color)} ${Math.round(stop.position * 100)}%`;
        }).join(', ');
        return `linear-gradient(${angle}rad, ${stops})`;
    },

    this.paintToRadialGradient = function (paint) {
        const stops = paint.gradientStops.map((stop) => {
            return `${colorString(stop.color)} ${Math.round(stop.position * 60)}%`;
        }).join(', ');

        return `radial-gradient(${stops})`;
    }
}