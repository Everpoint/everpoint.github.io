define(["require", "exports", "./Symbol", "../utils/utils", "../painters/DomPainter/SvgRender"], function (require, exports, Symbol_1, utils_1, SvgRender_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const DEFAULT_WRAPPER_CLASS_NAME = 'sGis-dynamicCluster';
    const DEFAULT_WRAPPER_STYLE = `
    display: -ms-flexbox;
    display: flex;
    -ms-flex-align: center;
    align-items: center;
    -ms-flex-pack: center;
    justify-content: center;
    border-radius: 50%;
    box-sizing: border-box;
    border-color: #fff;
    border-style: solid;
`;
    utils_1.setCssClasses({ [DEFAULT_WRAPPER_CLASS_NAME]: DEFAULT_WRAPPER_STYLE });
    const DEFAULT_SVG_CLASS_NAME = 'sGis-dynamicClusterSVG';
    const DEFAULT_SVG_STYLE = `
    overflow: visible;
    top: 0;
    left: 0;
    position: absolute;
`;
    utils_1.setCssClasses({ [DEFAULT_SVG_CLASS_NAME]: DEFAULT_SVG_STYLE });
    const DEFAULT_LABEL_CLASS_NAME = 'sGis-dynamicClusterLabel';
    const DEFAULT_LABEL_STYLE = `
    z-index: 1;
    font-size: 13px;
`;
    utils_1.setCssClasses({ [DEFAULT_LABEL_CLASS_NAME]: DEFAULT_LABEL_STYLE });
    class ClusterSymbol extends Symbol_1.DynamicPointSymbol {
        constructor({ node, count, wrapperClassNames = '', svgClassNames = '', labelClassNames = '', borderWidth = 2, strokeWidth = 6, size = 44 - strokeWidth, values = [], offset = [-size / 2, -size / 2], colors = [], fill = '#fff', stroke = '#89CCF1', } = {}) {
            super({ offset });
            this.wrapperClassNames = wrapperClassNames
                ? [DEFAULT_WRAPPER_CLASS_NAME].concat(wrapperClassNames.split(' '))
                : [DEFAULT_WRAPPER_CLASS_NAME];
            this.svgClassNames = svgClassNames
                ? [DEFAULT_SVG_CLASS_NAME].concat(svgClassNames.split(' '))
                : [DEFAULT_SVG_CLASS_NAME];
            this.labelClassNames = labelClassNames
                ? [DEFAULT_LABEL_CLASS_NAME].concat(labelClassNames.split(' '))
                : [DEFAULT_LABEL_CLASS_NAME];
            this.size = size;
            this.strokeWidth = strokeWidth;
            this.values = values;
            this.colors = colors;
            this.fill = fill;
            this.stroke = stroke;
            this.node = node;
            this.count = count;
            this.borderWidth = borderWidth;
        }
        polarToCartesian(centerX, centerY, radius, angleInDegrees) {
            const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
            return {
                x: centerX + radius * Math.cos(angleInRadians),
                y: centerY + radius * Math.sin(angleInRadians),
            };
        }
        describeArc(x, y, radius, startAngle, endAngle) {
            const start = this.polarToCartesian(x, y, radius, endAngle);
            const end = this.polarToCartesian(x, y, radius, startAngle);
            const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
            const d = [
                'M',
                start.x,
                start.y,
                'A',
                radius,
                radius,
                0,
                largeArcFlag,
                0,
                end.x,
                end.y,
            ].join(' ');
            return d;
        }
        _getFeatureNode() {
            const wrapper = document.createElement('div');
            if (this.count) {
                const label = document.createElement('div');
                label.innerText = this.count;
                label.classList.add(...this.labelClassNames);
                wrapper.appendChild(label);
            }
            if (this.node) {
                wrapper.appendChild(this.node);
            }
            else {
                const radius = this.size / 2 - this.borderWidth;
                const r2 = this.size + this.strokeWidth - this.borderWidth;
                const c = radius + this.strokeWidth / 2;
                const svg = new SvgRender_1.SvgRender({
                    width: r2,
                    height: r2,
                    viewBox: [0, 0, r2, r2].join(' '),
                })._getCircle({
                    r: radius,
                    cx: c,
                    cy: c,
                    stroke: this.stroke,
                    'stroke-width': this.strokeWidth,
                    fill: this.fill,
                    width: r2,
                    height: r2,
                    viewBox: [0, 0, r2, r2].join(' '),
                });
                const convertValuesToDeg = (values) => {
                    const sum = values.reduce((a, b) => a + b, 0);
                    return values.map(n => parseFloat((360 * n / sum).toFixed(1)));
                };
                let startAngle = 0;
                let endAngle = 0;
                convertValuesToDeg(this.values).forEach((value, index) => {
                    endAngle += value;
                    const path = new SvgRender_1.SvgRender({
                        width: r2,
                        height: r2,
                        viewBox: [0, 0, r2, r2].join(' '),
                    })._getPathNode({
                        d: this.describeArc(c, c, radius, startAngle, endAngle),
                        fill: 'transparent',
                        stroke: this.colors[index],
                        'stroke-width': this.strokeWidth,
                        width: r2,
                        height: r2,
                        viewBox: [0, 0, r2, r2].join(' '),
                    }).childNodes[0];
                    svg.appendChild(path);
                    startAngle += value;
                });
                svg.classList.add(...this.svgClassNames);
                wrapper.appendChild(svg);
            }
            wrapper.style.width = `${this.size + this.strokeWidth}px`;
            wrapper.style.height = `${this.size + this.strokeWidth}px`;
            wrapper.style.borderWidth = `${this.borderWidth}px`;
            wrapper.classList.add(...this.wrapperClassNames);
            return wrapper;
        }
    }
    exports.ClusterSymbol = ClusterSymbol;
});
