
const lib = {

	numberFormat: (value, retainDecimals = 0) => {
		const unit = ['', 'K', 'M', 'B', 'T', 'Q', 'Y'];
		let index = 0;
		while(value >= 1000){
			value /= 1000;
			index++;
		}
		return `${value.toFixed(retainDecimals)}${unit[index]}`;
	},

	trafficFormat: (value, retainDecimals = 0) => {
		const unit = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
		let index = 0;
		while(value >= 1024){
			value /= 1024;
			index++;
		}
		return `${value.toFixed(retainDecimals)}${unit[index]}`;
	},

	createElement: (tagName, data = null, options = {}) => {
		const el = document.createElement(tagName, options);
		if(data === null) return el;
		for(const key in data){
			el[key] = data[key];
		}
		return el;
	},
};

const loadLineChart = (el, data = {}, _data = {}) => {

	let throttle = false;
	const ro = new ResizeObserver((entries) => {
		if(throttle) return;
		throttle = true;
		setTimeout(() => {
			throttle = false;
			thisChart?.resize();
		}, 200);
	});
	ro.observe(el);

	const thisChart = echarts.init(el);
	thisChart.setOption(Object.assign({
		grid: {
			top: 30,
			left: 55,
			right: 25,
			bottom: 30,
		},
		xAxis: {
			type: 'category',
			data: [],
		},
		yAxis: {
			type: 'value',
			axisLabel: {
				formatter: (value) => lib.numberFormat(value),
			},
			splitLine: {
				show: true,
				lineStyle: {
					color: '#7F7F7F80',
					type: 'solid',
					width: 1
				},
			},
		},
		series: [
			{
				data: [],
				type: 'line',
				itemStyle: {
					color: '#06b0ff',
					width: 2,
				}
			}
		],
		tooltip: { // 鼠标悬停时显示数据框
			trigger: 'axis',
			axisPointer: {
				type: 'cross', // 显示十字架指示
				label: {
					formatter: (data) => {
						if(typeof data.value === 'number'){
							return `${lib.numberFormat(data.value, 2)}`;
						}
						return data.value;
					},
				},
			},
		},
	}, data));
};

const loadPieChart = (el, data = {}, _data = {}) => {

	let throttle = false;
	const ro = new ResizeObserver((entries) => {
		if(throttle) return;
		throttle = true;
		setTimeout(() => {
			throttle = false;
			thisChart?.resize();
		}, 200);
	});
	ro.observe(el);

	const thisChart = echarts.init(el);
	thisChart.setOption(Object.assign({
		series: [
			{
				name: 'Nightingale Chart',
				type: 'pie',
				radius: [20, 70],
				center: ['50%', '50%'],
				roseType: 'area',
				itemStyle: {
					borderRadius: 8
				},
				data: [],
			},
		],
		tooltip: {
			trigger: 'item',
			borderWidth: 0,
		},
	}, data));
};

const loadBarChart = (el, data = {}, _data = {}) => {

	let throttle = false;
	const ro = new ResizeObserver((entries) => {
		if(throttle) return;
		throttle = true;
		setTimeout(() => {
			throttle = false;
			thisChart?.resize();
		}, 200);
	});
	ro.observe(el);

	const thisChart = echarts.init(el);
	thisChart.setOption(Object.assign({
		grid: {
			top: 30,
			left: 55,
			right: 25,
			bottom: 30,
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'cross', // 显示十字架指示
				label: {
					formatter: (data) => {
						if(typeof data.value === 'number'){
							return `${lib.numberFormat(data.value, 2)}`;
						}
						return data.value;
					},
				},
			},
		},
		xAxis: {
			type: 'value',
			axisLabel: {
				formatter: (value) => lib.numberFormat(value),
			},
			splitLine: {
				show: true,
				lineStyle: {
					color: '#7F7F7F80',
					type: 'solid',
					width: 1
				},
			},
			// max: (value) => Math.max(...Object.values(value)) * 1.1,
		},
		yAxis: {
			data: ['IPv4', 'IPv6'],
		},
		series: [
			{
				type: 'bar',
				data: [100, 200]
			}
		]
	}, data));
};

/**
 * 相加两个对象的数值, 如果没有则创建
 * @param {Object} obj1 - 合并到对象
 * @param {Object} obj2 - 要合并的数据
 * @param {Boolean} ueeObj2 - 遍历 obj2 的数据, 默认只合并 obj1 中存在的数据
 */
const addObjValueNumber = (obj1, obj2, ueeObj2 = false) => {
	const reference = ueeObj2 ? obj2 : obj1;
	for(const key in reference){

		// 仅当遍历 obj1 时检查 obj2 中是否存在. 因为 obj1 可以添加 key
		if(ueeObj2 === false && obj2[key] === undefined){
			continue;
		}

		const constructor = reference[key].constructor;
		if(constructor === Number){
			if(obj1[key] === undefined) obj1[key] = 0;
			obj1[key] += obj2[key];
			continue;
		}
		if(constructor === Object){
			if(obj1[key] === undefined) obj1[key] = {};
			addObjValueNumber(obj1[key], obj2[key], ueeObj2);
			continue;
		}
	}
};

let statsData = null;

queueMicrotask(() => {
	const statsRunTime = document.querySelector('.statsInfo .statsRunTime');
	setInterval(() => {
		if(statsData !== null){

			const diff = Math.abs(Date.now() - statsData._worker.mainThread);
			const totalSeconds = Math.floor(diff / 1000);
			// 计算天时分秒
			const days = Math.floor(totalSeconds / (3600 * 24));
			const remainingSeconds = totalSeconds % (3600 * 24);
			const hours = Math.floor(remainingSeconds / 3600);
			const minutes = Math.floor((remainingSeconds % 3600) / 60);
			const seconds = remainingSeconds % 60;
			const parts = [];
			if(days > 0)	parts.push(`${days}天`);
			if(hours > 0)	parts.push(`${`${hours}`.padStart(2, '0')}时`);
			parts.push(`${`${minutes}`.padStart(2, '0')}分`);
			parts.push(`${`${seconds}`.padStart(2, '0')}秒`);

			statsRunTime.textContent = parts.join('');
		}
	}, 1000);
});

const loadStatsData = async () => {
	
	const response = await fetch('./api/stats');
	const data = await response.json();

	statsData = data.statsData;
	const statsDataTemp = data.statsDataTemp;

	// 由前端合并统计数据后显示, 逻辑与后端一致
	(() => { // ../main.js // 保存数据到每个图表

		addObjValueNumber(statsDataTemp, statsData._worker.syncData);

		statsData.hours.at(-1).bytes += statsDataTemp.bytes;
		statsData.hours.at(-1).hits += statsDataTemp.hits;

		statsData.days.at(-1).bytes += statsDataTemp.bytes;
		statsData.days.at(-1).hits += statsDataTemp.hits;

		statsData.months.at(-1).bytes += statsDataTemp.bytes;
		statsData.months.at(-1).hits += statsDataTemp.hits;

		statsData.years.at(-1).bytes += statsDataTemp.bytes;
		statsData.years.at(-1).hits += statsDataTemp.hits;

		statsData.heatmap.at(-1)[0] += statsDataTemp.hits;
		statsData.heatmap.at(-1)[1] += statsDataTemp.bytes;

		addObjValueNumber(statsData.all, statsDataTemp, true);
	})();


	// 统计信息
	(() => {
		const statsInfo = document.querySelector('.statsInfo');
		statsInfo.querySelector('.statsTotal').textContent = lib.numberFormat(statsData.all.hits);
		statsInfo.querySelector('.statsTotalTraffic').textContent = lib.trafficFormat(statsData.all.bytes);
	})();


	await new Promise(async (resolve, reject) => {
		// 获取现在的时间, 每次循环减去一小时
		let time = new Date();

		const xAxisData = [];
		const hitsData = [];
		const bytesData = [];

		for(const hourData of statsData.hours){
			xAxisData.unshift(`${time.getHours()}时`);
			hitsData.push(hourData.hits);
			bytesData.push(hourData.bytes);
			time.setHours(time.getHours() - 1);
		}

		await loadLineChart(document.getElementById('chart_stats_rv_hour'), {
			xAxis: {
				data: xAxisData,
			},
			series: [
				{
					data: hitsData,
					type: 'line',
					name: '请求',
					itemStyle: {
						color: '#10b981',
						width: 2,
					},
					markArea: {
						itemStyle: {
							color: '#20ff021c'
						},
						data: [
							[
								{
									xAxis: xAxisData.at(-2),
								},
								{
									xAxis: xAxisData.at(-1),
								}
							]
						]
					},
				},
			],
		}, bytesData);

		resolve();
	});

	await new Promise(async (resolve, reject) => {
		// 获取现在的时间, 每次循环减去一天
		let time = new Date();

		const xAxisData = [];
		const hitsData = [];
		const bytesData = [];

		for(const dayData of statsData.days){
			xAxisData.unshift(`${time.getMonth() + 1}-${time.getDate()}`);
			hitsData.push(dayData.hits);
			bytesData.push(dayData.bytes);
			time.setDate(time.getDate() - 1);
		}

		await loadLineChart(document.getElementById('chart_stats_rv_day'), {
			xAxis: {
				data: xAxisData,
			},
			series: [
				{
					data: hitsData,
					type: 'line',
					name: '请求',
					itemStyle: {
						color: '#06b0ff',
						width: 2,
					}
				},
			],
		}, bytesData);

		resolve();
	});

	await new Promise(async (resolve, reject) => {
		// 获取现在的时间, 每次循环减去一个月
		let time = new Date();

		const xAxisData = [];
		const hitsData = [];
		const bytesData = [];

		for(const monthData of statsData.months){
			xAxisData.unshift(`${time.getFullYear()}-${time.getMonth() + 1}`);
			hitsData.push(monthData.hits);
			bytesData.push(monthData.bytes);
			time.setMonth(time.getMonth() - 1);
		}

		await loadLineChart(document.getElementById('chart_stats_rv_month'), {
			xAxis: {
				data: xAxisData,
			},
			series: [
				{
					data: hitsData,
					type: 'line',
					name: '请求',
					itemStyle: {
						color: '#f88c00',
						width: 2,
					}
				},
			],
		}, bytesData);

		resolve();
	});

	// 目前不考虑年

	new Promise(async (resolve, reject) => {

		let hitsMin = 0;
		let hitsMax = 0;
		// let bytesMin = 0;
		// let bytesMax = 0;
		for(const li of statsData.heatmap){
			hitsMin = Math.min(hitsMin, li[0]);
			hitsMax = Math.max(hitsMax, li[0]);
			// bytesMin = Math.min(bytesMin, li[1]);
			// bytesMax = Math.max(bytesMax, li[1]);
		}
		const allocate = (value, min, max) => Math.min(Math.max(value !== 0 ? 1 : 0, Math.round((value - min) / (max - min) * 4)), 4);

		const oneYearAgo = new Date();
		oneYearAgo.setDate(oneYearAgo.getDate() - 365);
		// 从两端补齐到一年 + 一周的时间
		const data = [ ...Array.from({ length: oneYearAgo.getDay() }, () => null), ...statsData.heatmap, ...Array.from({ length: 6 - oneYearAgo.getDay() }, () => null) ];

		const heatmap = document.getElementById('chart_stats_rv_heatmap').querySelector('& > .heatmap') || (() => {
			const root = document.getElementById('chart_stats_rv_heatmap');

			const heatmap = lib.createElement('div', {
				className: `heatmap`,
				___lastData: Array.from({ length: data.length }, () => null),
			});

			const floating = lib.createElement('div', {
				className: 'floating',
			});

			for(let i = 0; i < data.length; i++){
				const li = lib.createElement('div', {
					className: `null`,
				})
				li.addEventListener('mouseover', (event) => {
					if(event.target.classList.contains('null')) return;
					floating.classList.add('--join');
					floating.style.top = `${event.target.offsetTop}px`;
					floating.style.left = `${event.target.offsetLeft}px`;
					floating.textContent = event.target.dataset.title;

					const animationProcessing = () => {
						const pos1 = floating.offsetLeft - (floating.offsetWidth + 10);
						if(pos1 < 0){
							floating.style.transform = `translate(calc(-50% - ${pos1 / 2}px), -34px)`;
						}
						const pos2 = (window.innerWidth - root.scrollLeft) - (floating.offsetLeft + (floating.offsetWidth + 10));
						if(pos2 < 0){
							floating.style.transform = `translate(calc(-50% + ${pos2 / 2}px), -34px)`;
						}

						const offsetLeft = floating.offsetLeft;
						setTimeout(() => {
							if(floating.offsetLeft !== offsetLeft){
								animationProcessing();
							}
						}, 50);
					};
					animationProcessing();
					
				});
				li.addEventListener('mouseout', (event) => {
					floating.classList.remove('--join');
				});
				heatmap.appendChild(li);
			}

			root.appendChild(heatmap);
			root.appendChild(floating);
			return heatmap;
		})();

		// 使用服务器的时间来计算数据
		const time = new Date(statsData._worker.saveTime || Date.now());
		let dayStep = 0;
		for(let i = data.length - 1; i >= 0; i--){

			// 当新数据与旧数据存在差异时更新元素
			if(heatmap.___lastData[i] === null || heatmap.___lastData[i][0] !== data[i][0] || heatmap.___lastData[i][1] !== data[i][1]){
				if(data[i] === null) continue;
				time.setDate(time.getDate() - dayStep);
				dayStep = 0;

				const day = heatmap.children[i];
				day.className = `lv-${allocate(data[i][0], hitsMin, hitsMax)}`;
				day.dataset.title = `${time.getFullYear()}-${`${time.getMonth() + 1}`.padStart(2, '0')}-${`${time.getDate()}`.padStart(2, '0')} - 请求: ${lib.numberFormat(data[i][0])}, 响应: ${lib.trafficFormat(data[i][1])}`;
			}

			dayStep ++;
		}

		heatmap.___lastData = data;

		resolve();
	});

	await new Promise(async (resolve, reject) => {

		const pieData = [];

		for(const deviceName in statsData.all.device){
			pieData.push({
				value: statsData.all.device[deviceName],
				name: deviceName,
			});
		}

		// 取数值最大的前10个, 过滤 0 值
		const top10 = pieData.filter(i => i.value > 0).sort((a, b) => b.value - a.value).slice(0, 10);

		loadPieChart(document.getElementById('chart_stats_device'), {
			series: [
				{
					// name: '常见用户代理',
					type: 'pie',
					radius: [20, 70],
					center: ['50%', '50%'],
					roseType: 'area',
					itemStyle: {
						borderRadius: 8
					},
					data: top10,
					label: {
						color: '#7f7f7fb5'
					},
				},
			]
		})

		resolve();
	});

	await new Promise(async (resolve, reject) => {

		loadBarChart(document.getElementById('chart_stats_network_type'), {
			series: [
				{
					type: 'bar',
					data: [
						{
							value: statsData.all.network.v4,
							itemStyle: {
								color: '#06B0FF'
							}
						},
						{
							value: statsData.all.network.v6,
							itemStyle: {
								color: '#ff8c00'
							}
						}
					],
				}
			]
		})

		resolve();
	});

};

queueMicrotask(() => {
	loadStatsData();
	setInterval(() => {
		loadStatsData();
	}, 7 * 1000);
});


