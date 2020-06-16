import React from "react";
import { Doughnut } from "react-chartjs-2";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles, useTheme } from "@material-ui/styles";
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  Typography
} from "@material-ui/core";
import { QueryRenderer } from "@cubejs-client/react";

const useStyles = makeStyles(theme => ({
  root: {
    height: "100%"
  },
  chartContainer: {
    position: "relative",
    height: "300px"
  },
  stats: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "center"
  },
  device: {
    textAlign: "center",
    padding: theme.spacing(1)
  },
  deviceIcon: {
    color: theme.palette.icon
  }
}));

const query = {
  "measures": [
    "Orders.count"
  ],
  "timeDimensions": [
    {
      "dimension": "Orders.createdAt"
    }
  ],
  "filters": [],
  "dimensions": [
    "Orders.status"
  ]
};

const OrdersStatus = props => {
  const { className, cubejsApi, ...rest } = props;

  const classes = useStyles();
  const theme = useTheme();

  return (
    <QueryRenderer
      query={query}
      cubejsApi={cubejsApi}
      render={({ resultSet }) => {
        if (!resultSet) {
          return <div className="loader"/>;
        }
        let result = resultSet.tablePivot();
        let allValues = calculateValueByArrayKey(resultSet.tablePivot(), "Orders.count");
        const colors = {
          "completed": theme.palette.secondary.main,
          "processing": theme.palette.secondary.light,
          "shipped": theme.palette.secondary.lighten
        };

        const data = {
          datasets: [
            {
              data: result.map((item) => {
                return (item["Orders.count"] / allValues * 100).toFixed(1);
              }),
              backgroundColor: result.map((item) => {
                return colors[item["Orders.status"]];
              }),
              borderWidth: 8,
              borderColor: theme.palette.white,
              hoverBorderColor: theme.palette.white
            }
          ],
          labels: result.map((item) => {
            return item["Orders.status"];
          })

        };

        const options = {
          legend: {
            display: false
          },
          responsive: true,
          maintainAspectRatio: false,
          cutoutPercentage: 80,
          layout: { padding: 0 },
          tooltips: {
            enabled: true,
            mode: "index",
            intersect: false,
            borderWidth: 1,
            borderColor: theme.palette.divider,
            backgroundColor: theme.palette.white,
            titleFontColor: theme.palette.text.primary,
            bodyFontColor: theme.palette.text.secondary,
            footerFontColor: theme.palette.text.secondary
          }
        };
        const orders = result.map((item, index) => {

          return {
            title: item["Orders.status"],
            value: (item["Orders.count"] / allValues * 100).toFixed(0),
            color: colors[item["Orders.status"]]
          };
        });
        return (
          <div>
            <Card
              {...rest}
              className={clsx(classes.root, className)}
            >
              <CardHeader
                title="Orders status"
              />
              <Divider/>
              <CardContent>
                <div className={classes.chartContainer}>
                  <Doughnut
                    data={data}
                    options={options}
                  />
                </div>
                <div className={classes.stats}>
                  {orders.map(device => (
                    <div
                      className={classes.device}
                      key={device.title}
                    >
                      <Typography variant="body1">{device.title}</Typography>
                      <Typography
                        variant="h2"
                      >
                        {device.value}%
                      </Typography>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }}
    />
  );
};

const calculateValueByArrayKey = (array, key) => {
  let count = 0;
  array.forEach((item) => {
    count += parseInt(item[key]);
  });
  return count;
};

OrdersStatus.propTypes = {
  className: PropTypes.string
};

export default OrdersStatus;