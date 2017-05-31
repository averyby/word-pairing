import v4 from 'uuid';
import './style/globalStyle.scss';

let putOntoPage = (() => {
	let positions = [];

	return (e) => {
		e.appendTo('#app');
		let pos = {
			leftTop: {
				x: parseFloat(e.css('left')),
				y: parseFloat(e.css('top'))  
			},
			width: e.outerWidth(),
			height: e.outerHeight()
		};
		if (positionOk(pos, positions)) {
			positions.push({ id: v4(), pos });
			return true;
		}
		e.remove();
		return false;
	}
})();

function positionOk({leftTop, width, height}, positions) {
	let { x, y } = leftTop;

	if (x + width > 490 || y + height > 490) return false;
	
	return positions.every(({pos}, i) => (
		x > pos.leftTop.x + pos.width ||
		x + width < pos.leftTop.x ||
		y > pos.leftTop.y + pos.height ||
		y + height < pos.leftTop.y
	));
}

$(function() {
	let dict = [
		{
			word: 'hello',
			meaning: 'used to greet others or to cause attention'
		},
		{
			word: 'portable',
			meaning: 'easy to carry'
		}
	];

	dict.forEach((item, index) => {
		createItem(item.word);
		createItem(item.meaning);
	});
});

function createItem(text) {
	let ele = $(`<div class='item'>${text}</div>`);
	let posOk = false;
	do {
		setPosition(ele);
		posOk = putOntoPage(ele);
	} while(!posOk);
	
	makeDraggable(ele);
}
function generateRandomPosition(x = 450, y = 450) {
	return {
		left: x * Math.random(),
		top: y * Math.random()
	};
}
function setPosition(e) {
	let pos = generateRandomPosition();

	e.css('left', pos.left);
	e.css('top', pos.top);
}
function makeDraggable(e) {
	e.draggable({
		containment: 'parent',
		stack: '.item'
	});
}



if (module.hot) {
	module.hot.accept()
}
