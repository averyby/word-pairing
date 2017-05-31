import v4 from 'uuid';
import { throttle } from 'lodash';
import { } from './utils';
import './style/globalStyle.scss';

let positions = [];
let tryTimes = 20;
let containerWidth;
let containerHeight;

let dict = [
	{
		tag: v4(),
		word: 'hello',
		meaning: 'used to greet others or to cause attention'
	},
	{
		tag: v4(),
		word: 'portable',
		meaning: 'easy to carry'
	},
	{
		tag: v4(),
		word: 'contrived',
		meaning: 'deliberately created rather than arising naturally or spontaneously'
	},
	{
		tag: v4(),
		word: 'interpolate',
		meaning: 'insert (something) between fixed points'
	},
	{
		tag: v4(),
		word: 'tinker',
		meaning: 'attempt to repair or improve something in a casual or desultory way, often to no useful effect'
	}
];

var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();
window.onresize = function() {
	delay(function() {
		$('#app').empty();
		positions = [];
		startApp();
	}, 500);
};

let putOntoPage = (e, positionOk) => {
	e.appendTo('#app');
	let pos = {
		leftTop: {
			x: parseFloat(e.css('left')),
			y: parseFloat(e.css('top'))  
		},
		width: e.outerWidth(),
		height: e.outerHeight()
	};
	if (positionOk(pos)) {
		makeAppear(e);
		storePosition(e, pos);
		return true;
	}
	e.remove();
	return false;
};

function makeAppear(e) {
	e.addClass('appear');
} 
function storePosition(e, pos) {
	let id = v4();
	e.data('posid', id);
	positions.push({ posid: id, pos });
}
function testerCreator(limit) {
	let tried = 0;

	return ({leftTop, width, height}) => {
		let { x, y } = leftTop;
		if (x + width > containerWidth || y + height > containerHeight) return false;

		if (limit != null && tried >= limit) return true;
		tried++;	
		return positions.every(({pos}, i) => (
			x > pos.leftTop.x + pos.width ||
			x + width < pos.leftTop.x ||
			y > pos.leftTop.y + pos.height ||
			y + height < pos.leftTop.y
		));
	}
}
function getNewValidLeftTop({width, height}) {
	let newLeftTop;
	let positionOk = testerCreator(tryTimes);
	do {
		newLeftTop = generateRandomPosition();
	} while (!positionOk({leftTop: newLeftTop, width, height}));

	return newLeftTop;
}
function startApp() {
	containerWidth = $('#app').width() - 10;
	containerHeight = $('#app').height() - 10;
	dict.forEach((item, index) => createPair(item));
};
$(startApp);

function createPair(item) {
	let word = createItem(item.word);
	let meaning = createItem(item.meaning);

	word.data('tag', item.tag);
	meaning.data('tag', item.tag);
}
function createItem(text) {
	let ele = $(`<div class='item'>${text}</div>`);
	let posOk = false;
	let positionOk = testerCreator(tryTimes);
	do {
		setPosition(ele);
		posOk = putOntoPage(ele, positionOk);
	} while(!posOk);
	
	makeDraggable(ele);
	makeDroppable(ele);
	return ele;
}
function generateRandomPosition() {
	return {
		x: (containerWidth - 40) * Math.random(),
		y: (containerHeight - 40) * Math.random()
	};
}
function setPosition(e) {
	let pos = generateRandomPosition();

	e.css('left', pos.x);
	e.css('top', pos.y);
}
function makeDraggable(e) {
	e.draggable({
		containment: 'parent',
		stack: '.item',
		stop: (event, ui) => {
			let dragSource = $(event.target);
			
			if (dragSource.data('handledByDrop')) {
				let posid = dragSource.data('posid');
				let prevPos = getPrevPos(posid);
				let newLeftTop = getNewValidLeftTop(prevPos);
				dragSource.animate({
					left: newLeftTop.x,
					top: newLeftTop.y
				}, 600, 'easeInOutBack', function() {});
				updatePosition(posid, {...prevPos, leftTop: newLeftTop});
			}
			dragSource.removeData('handledByDrop');
		}
	});
}

function getPrevPos(posid) {
	return positions.find((pos, i) => pos.posid === posid).pos;
}
function updatePosition(posid, newpos) {
	positions = positions.map((pos, i) => {
		if (pos.posid != posid) return pos;
		return {posid, pos: newpos};
	});
}
function removePositionById(posid) {
	positions = positions.filter((item, i) => item.posid != posid);
}
function removeItemByTag(t) {
	dict = dict.filter((item, i) => item.tag != t);
}
function makeDroppable(e) {
	e.droppable({
		tolerance: 'touch',
		drop: (event, ui) => {
			let dropTarget = $(event.target);
			let dragSource = ui.draggable;
			dragSource.data('handledByDrop', true);
			if (dropTarget.data('tag') === dragSource.data('tag')) {
				removePositionById(dropTarget.data('posid'));
				removePositionById(dragSource.data('posid'));
				removeItemByTag(dragSource.data('tag'));
				dropTarget.remove();
				dragSource.remove();
				return;
			}
		}
	});
}



if (module.hot) {
	module.hot.accept()
}
