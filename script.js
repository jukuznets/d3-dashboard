function dashboard() {
    function lineChart() {
        const margin = { top: 40, right: 90, bottom: 70, left: 30 },
            width = 960 - margin.left - margin.right,
            height = 250 - margin.top - margin.bottom;

        const parseTime = d3.timeParse("%m/%d/%Y"),
            formatDate = d3.timeFormat("%b %d")

        bisectDate = d3.bisector((d) => {
            return d.date;
        }).left;

        const x = d3.scaleTime().range([0, width]);
        const y = d3.scaleLinear().range([height , 0]);

        d3.select("#root")
            .append("div")
            .attr("class", "block")
            .attr("id", "lchartContainer");

        const svg = d3
            .select("#lchartContainer")
            .append("svg")
            .attr(
                "viewBox",
                `0 0 ${width + margin.left + margin.right} ${
                height + margin.top + margin.bottom
                }`
            )
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 5)
            .attr("x", 0 - height / 1.5)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Daily users");

        svg
            .append("text")
            .attr("class", "title")
            .attr("x", width / 2)
            .attr("y", 0 - margin.top / 2)
            .attr("text-anchor", "middle")
            .text("Daily users");

        const line = d3
            .line()
            .x((d) => {
                return x(d.date);
            })
            .y((d) => {
                return y(d.users);
            })
            .curve(d3.curveCardinal);

        const area = d3
            .area()
            .x((d) => {
                return x(d.date) + margin.left;
            })
            .y0(height + margin.top) 
            .y1((d) => {
                return y(d.users) + margin.top
            })
            .curve(d3.curveCardinal);

        const g = svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.csv(
        "https://raw.githubusercontent.com/jukuznets/d3-dashboard/main/data/daily-users-25022020-25022021.csv",
        function (error, data) {
            if (error) throw error;

            data.forEach((d) => {
                d.date = parseTime(d.date);
                d.users = Number(d.users);
            });

            x.domain(
            d3.extent(data, (d) => {
                return d.date;
            })
            );

            y.domain([
            d3.min(data, (d) => {
                return d.users;
            }) / 1.005,
            d3.max(data, (d) => {
                return d.users;
            }) * 1.005,
            ]);

            g.append("g")
                .attr("class", "axis x")
                .attr("transform", "translate(0," + height + ")")
                .transition()
                .duration(750)
                .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b")));

            g.append("g")
                .attr("class", "axis y")
                .transition()
                .duration(750)
                .call(d3.axisLeft(y));

            const valueLine = g
                .append("path")
                .datum(data)
                .attr("class", "line")
                .attr("d", line);

            const pathLength = valueLine.node().getTotalLength();
            valueLine
                .attr("stroke-dasharray", pathLength)
                .attr("stroke-dashoffset", pathLength)
                .attr("stroke-width", 3)
                .transition()
                .duration(1000)
                .attr("stroke-width", 0)
                .attr("stroke-dashoffset", 0);

            svg
                .append("path")
                .data([data])
                .attr("class", "area")
                .attr("d", area)
                .attr("transform", "translate(0,300)")
                .transition()
                .duration(1000)
                .attr("transform", "translate(0,0)");

            const focus = g
                .append("g")
                .attr("class", "focus")
                .style("display", "none");

            focus
                .append("text")
                .attr("class", "y1")
                .attr("dx", 8)
                .attr("dy", "-.3em");
            focus
                .append("text")
                .attr("class", "y2")
                .attr("dx", 8)
                .attr("dy", "-.3em");
            focus
                .append("text")
                .attr("class", "y3")
                .attr("dx", 8)
                .attr("dy", "1em");
            focus
                .append("text")
                .attr("class", "y4")
                .attr("dx", 8)
                .attr("dy", "1em");
            focus
                .append("line")
                .attr("class", "x")
                .style("stroke-dasharray", "3,3")
                .style("opacity", 0.5)
                .attr("y1", 0)
                .attr("y2", height);
            focus
                .append("line")
                .attr("class", "y")
                .style("stroke-dasharray", "3,3")
                .style("opacity", 0.5)
                .attr("x1", width)
                .attr("x2", width);
            focus
                .append("circle")
                .attr("class", "y")
                .style("fill", "none")
                .attr("r", 4);

            svg
                .append("rect")
                .attr(
                    "transform",
                    "translate(" + margin.left + "," + margin.top + ")"
                )
                .attr("class", "overlay")
                .attr("width", width)
                .attr("height", height)
                .on("mouseover", function () {
                    focus.style("display", null);
                })
                .on("mouseout", function () {
                    focus.style("display", "none");
                })
                .on("mousemove", moveMouse);

            function moveMouse() {
                const x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(data, x0, 1),
                d0 = data[i - 1],
                d1 = data[i],
                d = x0 - d0.date > d1.date - x0 ? d1 : d0;

                focus
                    .select("circle.y")
                    .attr(
                        "transform",
                        "translate(" + x(d.date) + "," + y(d.users) + ")"
                    );

                focus
                    .select("text.y1")
                    .attr(
                    "transform",
                    "translate(" + x(d.date) + "," + y(d.users) + ")"
                    )
                    .text(d.users);

                focus
                    .select("text.y2")
                    .attr(
                    "transform",
                    "translate(" + x(d.date) + "," + y(d.users) + ")"
                    )
                    .text(d.users);

                focus
                    .select("text.y3")
                    .attr(
                    "transform",
                    "translate(" + x(d.date) + "," + y(d.users) + ")"
                    )
                    .text(formatDate(d.date));

                focus
                    .select("text.y4")
                    .attr(
                    "transform",
                    "translate(" + x(d.date) + "," + y(d.users) + ")"
                    )
                    .text(formatDate(d.date));

                focus
                    .select(".x")
                    .attr(
                    "transform",
                    "translate(" + x(d.date) + "," + y(d.users) + ")"
                    )
                    .attr("y2", height - y(d.users));

                focus
                    .select(".y")
                    .attr(
                    "transform",
                    "translate(" + width * -1 + "," + y(d.users) + ")"
                    )
                    .attr("x2", width + width);
            }
        }
        );
    }

    function dataMap() {
        const format = d3.format(",");

        const tip = d3
            .tip()
            .attr("class", "d3-tip")
            .offset([-10, 0])
            .html(function (d) {
            return (
                "<strong>Country: </strong><span class='details'>" +
                d.properties.name +
                "<br></span>" +
                "<strong>Users: </strong><span class='details'>" +
                format(d.users) +
                "</span>"
            );  
        });

        const margin = { top: 0, right: 0, bottom: 60, left: 0 },
            width = 960 - margin.left - margin.right,
            height = 450 - margin.top - margin.bottom;

        const color = d3
            .scaleThreshold()
            .domain([1, 50, 100, 250, 500, 750, 1000, 1500, 5000, 6500])
            .range([
            "rgb(247,251,255)",
            "rgb(222,235,247)",
            "rgb(198,219,239)",
            "rgb(158,202,225)",
            "rgb(107,174,214)",
            "rgba(65, 131, 215, 1)",
            "rgb(33,113,181)",
            "rgb(8,81,156)",
            "rgb(8,48,107)",
            "rgb(0,0,255)",
            ]);

        d3.select("#root")
            .append("div")
            .attr("class", "block")
            .attr("id", "mapContainer");

        const svg = d3
            .select("#mapContainer")
            .append("svg")
            .attr(
                "viewBox",
                `0 0 ${width + margin.left + margin.right} ${
                height + margin.top + margin.bottom
                }`
            )
            .append("g")
            .attr("class", "map");

        svg
            .append("text")
            .attr("class", "title")
            .attr("x", width / 2)
            .attr("y", 15 - margin.top)
            .attr("text-anchor", "middle")
            .text("User locations");

        const projection = d3
        .geoMercator()
        .scale(90)
        .translate([width / 2, height / 1.2]);

        const path = d3.geoPath().projection(projection);

        svg.call(tip);

        queue()
        .defer(
            d3.json,
            "https://raw.githubusercontent.com/jukuznets/d3-dashboard/main/world_countries.json"
        )
        .defer(
            d3.csv,
            "https://raw.githubusercontent.com/jukuznets/d3-dashboard/main/data/locations-25022020-25022021.csv"
        )
        .await(ready);

        function ready(error, data, users) {
        const usersById = {};

        users.forEach(function (d) {
            d.users = parseInt(d.users.replace(/,/g, ""));
            usersById[d.id] = +d.users;
        });
        data.features.forEach(function (d) {
            d.users = usersById[d.id];
        });

        svg
            .append("g")
            .attr("class", "countries")
            .selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", function (d) {
                return color(usersById[d.id]);
            })
            .style("stroke", "white")
            .style("stroke-width", 1.5)
            .style("opacity", 0.8)
            // tooltips
            .style("stroke", "white")
            .style("stroke-width", 0.3)
            .on("mouseover", function (d) {
            tip.show(d);
            d3.select(this)
                .style("opacity", 1)
                .style("stroke", "white")
                .style("stroke-width", 3);
            })
            .on("mouseout", function (d) {
            tip.hide(d);
            d3.select(this)
                .style("opacity", 0.8)
                .style("stroke", "white")
                .style("stroke-width", 0.3);
            });

            svg
            .append("path")
            .datum(
                topojson.mesh(data.features, function (a, b) {
                return a.id !== b.id;
                })
            )
            .attr("class", "names")
            .attr("d", path);
        }
    }

    const data1 = [
        {name: "Desktop", value: 44870},
        {name: "Mobile & Tablet", value: 2762},
    ];

    const data2 = [
        {name: "Organic search", value: 45509},
        {name: "Direct", value: 1772},
    ];

    const data3 = [
        {name: "Chrome", value: 38948},
        {name: "Firefox", value: 4515},
        {name: "Safari", value: 2116},
        {name: "Others", value: 1914},
    ];

    function pieChart() {
        const margin = { top: 5, right: 0, bottom: 0, left: 0 },
            width = 150 - margin.left - margin.right,
            height = 125 - margin.top - margin.bottom,
            opacity = .8,
            opacityHover = 1,
            otherOpacityOnHover = .8,
            radius = Math.min(width, height) / 2,
            color = d3.scaleOrdinal().range(["blue", "CornflowerBlue", "Darkblue", "DodgerBlue", "LightBlue", "LightSteelBlue"]);
    
        const pieContainer = d3.select("#root")
            .append("div")
            .attr("class", "block")
            .attr("id", "pieContainer");

        pieContainer.append("div").attr("id", "pie1").attr("class", "pie-wrapper");
        pieContainer.append("div").attr("id", "pie2").attr("class", "pie-wrapper");
        pieContainer.append("div").attr("id", "pie3").attr("class", "pie-wrapper");

        function drawPie(pieID, data, pieText) {
            d3.select(pieID)
                .append("h2")
                .attr("class", "pie-title")
                .attr("x", width / 2)
                .attr("y", margin.top)
                .text(pieText);

            const svg = d3.select(pieID)
                .append("svg")
                .attr(
                        "viewBox",
                        `0 0 ${width + margin.left + margin.right} 
                        ${height + margin.top + margin.bottom}`
                    )
                .append("g");
    
            svg.append("g").attr("class", "slices");
            svg.append("g").attr("class", "labels");
            svg.append("g").attr("class", "lines");
            svg.append("g").attr("class", "texts");
    
            const pie = d3.pie().sort(null).value(d => d.value);
            const arc = d3.arc().innerRadius(radius*0.8).outerRadius(radius*0.6);
    
            const outerArc = d3.arc()
                        .outerRadius(radius * 0.9)
                        .innerRadius(radius * 0.9);

            svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
            
            svg.selectAll("path")
                .data(pie(data))
                .enter()
                .append("path")
                .attr("d", arc)
                .attr("fill", (d,i)=> color(i))
                .style("opacity", opacity)
            
                .on("mouseover", function(d) {
                    d3.selectAll("#pieContainer path").style("opacity", otherOpacityOnHover);
                    d3.select(this).style("opacity", opacityHover);
                })

                .on("mouseout", function(d) {   
                    d3.selectAll("#pieContainer path").style("opacity", opacity);
                })
            
            svg.append("g").classed("labels", true);
            svg.append("g").classed("lines", true);

            const polyline = svg.select(".lines")
                .selectAll("polyline")
                .data(pie(data))
                .enter()
                .append("polyline")
                .attr("points", function(d) {  
                    var pos = outerArc.centroid(d);
                    pos[0] = radius * 0.3 * (midAngle(d) < Math.PI ? 1 : -1);
                    return [arc.centroid(d), outerArc.centroid(d), pos]
                });    	
	
            const label = svg.select(".labels").selectAll("text")
                .data(pie(data))
                .enter().append("text")
                .attr("dy", ".35em")
                .html((d) => {
                    return d.data.name + ": " + d.data.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                })
                .attr("transform", (d) => {
                    var pos = outerArc.centroid(d);
                    pos[0] = radius * 0.3 * (midAngle(d) < Math.PI ? 1 : -1);
                    return "translate(" + pos + ")";
                })
                .style("text-anchor", (d) => {
                    return midAngle(d) < Math.PI ? "start" : "end";
                });
    
            function midAngle(d) { return d.startAngle + (d.endAngle - d.startAngle) / 2; } 
        }

        drawPie("#pie1", data1, "User technology");
        drawPie("#pie2", data2, "User acquisition");
        drawPie("#pie3", data3, "User browsers");
    }

    function barChart() {
        const barContainer = d3.select("#root")
            .append("div")
            .attr("class", "block")
            .attr("id", "barContainer");
        
        const margin = {top: 40, right: 20, bottom: 30, left: 150},
            width = 960 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        const svg = d3.select("#barContainer")
                    .append("svg")
                    .attr(
                            "viewBox",
                            `0 0 ${width + margin.left + margin.right} 
                            ${height + margin.top + margin.bottom}`
                        )
                    .append("g");

        svg
            .append("text")
            .attr("class", "title")
            .attr("x", width / 1.7)
            .attr("y", margin.top - 20)
            .attr("text-anchor", "middle")
            .text("Top 10 queries by clicks");

        const tooltip = d3.select("#barContainer").append("div").attr("class", "toolTip");
        
        const x = d3.scaleLinear().range([0, width]);
        const y = d3.scaleBand().range([height, 0]);

        const g = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.csv("https://raw.githubusercontent.com/jukuznets/d3-dashboard/main/data/queries-25022020-25022021.csv", (error, data) => {
            if (error) throw error;
        
            data.sort((a, b) => a.clicks - b.clicks);
        
            x.domain([0, d3.max(data, (d) => d.clicks)]);
            y.domain(data.map((d) => d.query)).padding(0.1);

            g.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).ticks(5).tickFormat((d) =>parseInt(d)).tickSizeInner([-height]));

            g.append("g")
                .attr("class", "y axis")
                .call(d3.axisLeft(y));

            const bar = g.selectAll(".bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", 0)
                .attr("height", y.bandwidth())
                .attr("y", (d) => y(d.query))
                .attr("width", (d) => x(d.clicks))
                .on("mousemove", (d) => {
                    tooltip
                        .style("left", d3.event.pageX - 50 + "px")
                        .style("top", d3.event.pageY - 70 + "px")
                        .style("display", "inline-block")
                        .html(
                            "<strong>Clicks: </strong><span class='details'>" +
                            d.clicks +
                            "<br></span>" +
                            "<strong>Impressions: </strong><span class='details'>" +
                            d.impressions +
                            "</span>");
                })
                .on("mouseout", (d) => {
                    tooltip.style("display", "none");
                })
        });
    }

    lineChart();
    dataMap();
    pieChart();
    barChart();
}

dashboard();