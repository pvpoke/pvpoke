/*
* Code provided by liuxd
* https://www.cssscript.com/minimal-hexagon-radar-chart-javascript-six-js/
*/

var hexagon = {
    bg_default_color: 'rgba(255,255,255,0.75)',
    value_default_color: '#ffff99',
    x_offset: 60,
	y_offset: 20,
    ssin: function(degree) {
        return Math.sin(degree * Math.PI / 180);
    },
    init: function(element, side_length, color) {
        this.side_length = side_length;
        this.hexagon = element[0];
        this.hexagon.width = this.side_length * 2 * this.ssin(60) + this.x_offset * 2;
        this.hexagon.height = this.side_length * 2;

        var width = this.hexagon.width;
        var height = this.hexagon.height;
        var S = this.x_offset;

        if (typeof (color) === 'undefined') {
            color = this.bg_default_color;
        }

        hexagoncontext = this.hexagon.getContext('2d');
        hexagoncontext.fillStyle = color;
        hexagoncontext.strokeStyle = color;
        hexagoncontext.beginPath();
        hexagoncontext.moveTo(width / 2, 0);
        hexagoncontext.lineTo(width - S, height / 4);
        hexagoncontext.lineTo(width - S, height * 3 / 4);
        hexagoncontext.lineTo(width / 2, height);
        hexagoncontext.lineTo(S, height * 3 / 4);
        hexagoncontext.lineTo(S, height / 4);
        hexagoncontext.lineTo(width / 2, 0);
        hexagoncontext.stroke();
        hexagoncontext.fill();
    },
    draw: function(values, color, compare) {
        if (values.length < 6) {
            return false;
        }

        for (i in values) {
            values[i] = parseFloat(values[i]);

            if (values[i] > 1 || values[i] < 0) {
                return false;
            }
        }

        if (typeof (color) === 'undefined') {
            color = this.value_default_color;
        }

        var width = this.hexagon.width;
        var L = this.side_length;
        var S = this.x_offset;
        var V = values;

        hexagoncontext = this.hexagon.getContext('2d');
        hexagoncontext.fillStyle = color;
        hexagoncontext.strokeStyle = color;

		if(compare){
			hexagoncontext.lineWidth = 2;
			hexagoncontext.setLineDash([5, 3]);
		} else{
			hexagoncontext.lineWidth = 1;
		}

        hexagoncontext.beginPath();
        hexagoncontext.moveTo(width / 2, L * (1 - V[0]));
        hexagoncontext.lineTo(this.ssin(60) * L * (1 + V[1]) + S, (1 - V[1] / 2) * L);
        hexagoncontext.lineTo(this.ssin(60) * L * (1 + V[2]) + S, (1 + V[2] / 2) * L);
        hexagoncontext.lineTo(width / 2, (1 + V[3]) * L);
        hexagoncontext.lineTo(this.ssin(60) * L * (1 - V[4]) + S, (1 + V[4] / 2) * L);
        hexagoncontext.lineTo(this.ssin(60) * L * (1 - V[5]) + S, (1 - V[5] / 2) * L);
        hexagoncontext.lineTo(width / 2, L * (1 - V[0]));
        hexagoncontext.stroke();

		if(! compare){
			hexagoncontext.fill();
		}

		var width = this.hexagon.width;
		var height = this.hexagon.height;

		/*hexagoncontext.strokeStyle = '#000';
		hexagoncontext.fillStyle = '#000';
        hexagoncontext.fillText(names[0] + '98', width / 2 + S / 2, 10);
        hexagoncontext.fillText(names[1], width - S, height / 4);
        hexagoncontext.fillText(names[2], width - S, height * 3 / 4);
        hexagoncontext.fillText(names[3], width / 2 + S / 2, height);
        hexagoncontext.fillText(names[4], 0, height * 3 / 4);
        hexagoncontext.fillText(names[5], 0, height / 4);*/
    }
};
