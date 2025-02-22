import React, { useState } from "react"
import { Button, Box, Label, Dropdown } from "components/UIElements"
import { Row, Column } from "components/Containers"
import { darkred } from "../../../theme/Colors"
import { httpget, httppost } from "../../../backend"
import styled from "styled-components"
import { ReactComponent as RawUGV } from "icons/ugv.svg"
import { ReactComponent as RawUAV } from "icons/uav.svg"
import { useInterval } from "../../../util"

const actions = {
	waypoint: [0, 1, 2, 3, 4]
}

const Modes = ["Manual", "Auto", "Loiter", "RTL", "Takeoff", "Land", "Circle", "Stabilize"]

const Actions = () => {
	const [Aaltitude, setAaltitude] = useState(0)
	const [AaltitudeGlobal, setAaltitudeGlobal] = useState(0)
	const [AaltitudeIsGlobal, setAaltitudeIsGlobal] = useState(false)
	// const [Athrottle, setAthrottle] = useState(0)
	const [Aorientation, setAorientation] = useState({ "yaw": 0, "pitch": 0, "roll": 0 })
	// const [AlatLong, setAlatLong] = useState({ "lat": 0, "lon": 0 })
	const [Amode, setAmode] = useState("")
	const [Aarmed, setAarmed] = useState("")
	// const [Astatus, setAstatus] = useState("")
	const [AgroundSpeed, setAgroundSpeed] = useState(0)
	// const [Aairspeed, setAairspeed] = useState(0)
	// const [Abattery, setAbattery] = useState(16)
	const [Awaypoint, setAwaypoint] = useState([1, 0])
	// const [Aconnection, setAconnection] = useState([95, 0, 95])

	const [Garmed, setGarmed] = useState("")
	const [GgroundSpeed, setGgroundSpeed] = useState(0)
	const [Gyaw, setGyaw] = useState(0)
	const [GlatLong, setGlatLong] = useState({ "lat": 0, "lon": 0 })
	const [Gstatus, setGstatus] = useState("")
	const [Gmode, setGmode] = useState("")
	const [Gdestination, setGdestination] = useState(0)
	const [Gbattery, setGbattery] = useState(16)
	const [Gconnection, setGconnection] = useState([95, 0, 95])

	useInterval(250, () => {
		httpget("/uav/stats", ({ data }) => {
			setAaltitude(data.result.quick.altitude)
			setAaltitudeGlobal(data.result.quick.altitude_global)
			// setAthrottle(data.result.quick.throttle)
			setAorientation({"yaw": data.result.quick.orientation.yaw, "roll": data.result.quick.orientation.roll, "pitch": data.result.quick.orientation.pitch })
			// setAlatLong({"lat": data.result.quick.lat, "lon": data.result.quick.lon})
			setAmode(data.result.mode)
			setAarmed(data.result.armed)
			// setAstatus(data.result.status)
			setAgroundSpeed(data.result.quick.ground_speed)
			// setAairspeed(data.result.quick.air_speed)
			// setAbattery(data.result.quick.battery)
			// setAtemperature(data.result.quick.temperature)
			setAwaypoint(data.result.quick.waypoint)
			// setAconnection(data.result.quick.connection)
		})
		httpget("/ugv/stats", ({ data }) => {
			setGarmed(data.result.armed)
			setGgroundSpeed(data.result.quick.ground_speed)
			setGyaw(data.result.quick.yaw)
			setGlatLong({"lat": data.result.quick.lat, "lon": data.result.quick.lon})
			setGstatus(data.result.status)
			setGmode(data.result.mode)
			setGdestination(data.result.quick.destination[1])
			setGbattery(data.result.quick.battery)
			setGconnection(data.result.quick.connection)
		})
	})

	const [waypointNum, setWaypointNum] = useState(1)

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "calc(100vh - 9.5rem)",
			}}
		>
			<StyledDiv>
				<Label className="paragraph" style={{ "font-size": "2em", color: "black", "margin-top": "auto", "margin-bottom": 0 }}>UAV</Label>
				<UAV />
			</StyledDiv>
			<Column style={{ marginBottom: "1rem", gap: "0.5rem" }}>
				<Row style={{ gap: "1rem" }}>
					<Row>
						<Box
							label="Altitude"
							content={AaltitudeIsGlobal ? AaltitudeGlobal.toFixed(2) + " ft MSL" : Aaltitude.toFixed(2) + " ft AGL"}
							onClick={() => { setAaltitudeIsGlobal(!AaltitudeIsGlobal) }}
							title="The plane's altitude. MSL refers to above mean sea level. AGL is the height from the ground where the plane is."
						/>
						<Box label="Ground Speed" content={AgroundSpeed.toFixed(2) + " mph"} title="Speed from GPS." />
					</Row>
					<Row>
						<Box label="Roll" content={(Aorientation.roll.toFixed(2)) + "\u00B0"} />
						<Box label="Pitch" content={(Aorientation.pitch.toFixed(2)) + "\u00B0"} />
						<Box label="Yaw" content={(Aorientation.yaw.toFixed(2))  + "\u00B0"} />
					</Row>
				</Row>
			</Column>
			<Column>
				<Row id="labels1" height="2rem" gap="0.5rem">
					<Label columns={1}>Flight Mode</Label>
				</Row>
			</Column>

			<Column style={{ marginBottom: "1rem" }}>
				<Row height="3rem">
					<Dropdown
						initial={Modes.find(m => m.toUpperCase() === Amode)}
						onChange={i => {
							let m = Modes[i].toUpperCase()
							if (m === "LAND") {
								httppost("/uav/commands/insert", { "command": "LAND", "lat": 0.0, "lon": 0.0, alt: 0.0 })
							} else {
								httppost("/uav/mode/set", { "mode": m })
							}
							setAmode(m)
						}}
					>
						{Modes.map((v, i) => {
							return (
								<span value={i}>{v}</span>
							)
						})}
					</Dropdown>
					<Button onClick={() => { setAmode("MANUAL"); httppost("/uav/mode/set", { "mode": "MANUAL" }) }} title="Switch the plane mode to Manual.">Manual</Button>
					<Button onClick={() => { setAmode("AUTO"); httppost("/uav/mode/set", { "mode": "AUTO" }) }} title="Switch the plane mode to Auto.">Auto</Button>
					<Button onClick={() => { setAmode("RTL"); httppost("/uav/mode/set", { "mode": "RTL" }) }} title="Switch the plane mode to RTL.">RTL</Button>
					<Button onClick={() => { setAmode("LOITER"); httppost("/uav/mode/set", { "mode": "LOITER" }) }} title="Switch the plane mode to Loiter.">Loiter</Button>
				</Row>
			</Column>
			<Column>
				<Row id="labels4" height="2rem" gap="0.5rem">
					<Label columns={1}>Configuration</Label>
				</Row>
			</Column>
			<Column style={{ marginBottom: "1rem" }}>
				<Row height="2.5rem">
					<Button warning={true} color={darkred} onClick={() => httppost("/uav/sethome")} title="Set the plane home position.">Set home</Button>
					<Button warning={true} color={darkred} onClick={() => httppost("/uav/calibrate")}>Calibration?</Button>
					<Button warning={true} color={darkred} onClick={() => httppost(Aarmed === "ARMED" ? "/uav/disarm" : "/uav/arm")} title={Aarmed === "ARMED" ? "Disarm the plane." : "Arm the plane."}>{Aarmed === "ARMED" ? "Disarm" : "Arm"}</Button>
					<Button warning={true} color={darkred} onClick={() => httppost("/uav/restart")} title="Restart the Pixhawk.">Restart</Button>
				</Row>
			</Column>
			<Column>
				<Row id="labels2" height="2rem" gap="0.5rem">
					<Label columns={1}>Waypoints (Current: {Awaypoint[0]})</Label>
				</Row>
			</Column>
			<Column style={{ marginBottom: "1rem" }}>
				<Row height="2.5rem">
					<Row>
						<Box
							content=""
							onChange={v => {
								let value = v
								let newvalue = ""
								if (value.length > 3) {
									value = v.substring(0, 3)
								}
								console.log(value)
								if (value.length >= 1) {
									for (let i = 0; i < value.length; i++) {
										let ascii = value.charCodeAt(i)
										if (ascii >= 48 && ascii <= 57) {
											newvalue += value[i]
										}
									}
								}
								setWaypointNum(parseInt(newvalue))
								return newvalue
							}}
							onKeyDown={e => {
								if (e.nativeEvent.key === "Enter") e.preventDefault()
								e.stopPropagation()
							}}
							placeholder="#"
							style={{ textAlign: "center", height: "2.5rem" }}
							line="250%"
							editable
						/>
						<Button onClick={() => httppost("/uav/commands/jump", { "command": waypointNum })}>Go!</Button>
					</Row>
					<Button onClick={() => httppost("/uav/commands/jump", { "command": 1 })}>Waypoints (#1?)</Button>
					<Button onClick={() => httppost("/uav/commands/jump", { "command": 20 })}>Odlc (#20?)</Button>
					<Button onClick={() => httppost("/uav/commands/jump", { "command": 50 })}>Map (#50?)</Button>
				</Row>
			</Column>
			<Column>
				<Row id="labels3" height="2rem" gap="0.5rem">
					<Label columns={1}>Mission</Label>
				</Row>
			</Column>
			<Column style={{ marginBottom: "1rem" }}>
				<Row height="2.5rem">
					<Button href="http://localhost:5000/uav/commands/view" newTab={true} title="Open the plane Pixhawk mission file in a new tab.">View</Button>
					<Button onClick={() => httppost("/uav/commands/write")} title="Write the Pixhawk mission file to the plane.">Write</Button>
					<Button onClick={() => httppost("/uav/commands/load")} title="Load the Pixhawk mission file from the plane into the backend.">Load</Button>
					<Button onClick={() => httppost("/uav/commands/clear")} title="Clear the mission file in the backend, but not the plane.">Clear</Button>
					<Button warning={true} color={darkred} onClick={() => httppost("/uav/terminate")} title="Make the plane terminate (force it to crash), if configured.">Terminate</Button>
				</Row>
			</Column>
			<StyledDiv style={{ marginTop: "1.5rem" }}>
				<Label className="paragraph" style={{"font-size": "2em", "color": "black"}}>UGV</Label>
				<UGV />
			</StyledDiv>
			<Column style={{ marginBottom: "1rem", gap: "0.5rem" }}>
				<Row style={{ gap: "1rem" }}>
					<Row>
						<Column>
							<Row>
								<Box label="Yaw" content={(Gyaw.toFixed(2))  + "\u00B0"} />
								<Box label="Speed" content={GgroundSpeed.toFixed(2) + " mph"} />
							</Row>
						</Column>
						<Row>
						<Column>
							<Row id="labels1" height="0rem" gap="0.5rem">
								<Label columns={1}>Mission</Label>
							</Row>
							<Row>
								<Button href="http://localhost:5000/ugv/commands/view" newTab={true} title="Open the UGV Pixhawk mission file in a new tab.">View</Button>
								<Button onClick={() => httppost("/ugv/commands/write")} title="Send destination to the UGV">Write</Button>
							</Row>
						</Column>
						<Column>
							<Row id="labels1" height="0rem" gap="0.5rem">
								<Label columns={1}>Flight Mode</Label>
							</Row>
							<Row height="3rem" style={{ marginTop: "1rem" }}>
								<Dropdown
									initial={Modes.find(m => m.toUpperCase() === Gmode)}
									onChange={i => {
										let m = Modes[i].toUpperCase()
										httppost("/ugv/mode/set", {"mode": m})
										setGmode(m)
									}}
								>
									{Modes.map((v, i) => {
										return (
											<span value={i}>{v}</span>
										)
									})}
								</Dropdown>
							</Row>
						</Column>
						</Row>
					</Row>
				</Row>
			</Column>
			<Column>
				<Row id="labels3" height="2rem" gap="0.5rem">
					<Label columns={3}>Mission</Label>
					<Label columns={3}>Configuration</Label>
				</Row>
			</Column>
			<Column style={{ marginBottom: "1rem" }}>
				<Row height="2.5rem">
					<Button warning={true} color={darkred} onClick={() => httppost("/ugv/sethome")} title="Set the UGV home position.">Set home?</Button>
					<Button warning={true} color={darkred} onClick={() => httppost("/ugv/calibrate")}>Calibration?</Button>
					<Button warning={true} color={darkred} onClick={() => httppost(Garmed === "ARMED" ? "/ugv/disarm" : "/ugv/arm")} title={Aarmed === "ARMED" ? "Disarm the UGV." : "Arm the UGV."}>{Garmed === "ARMED" ? "Disarm" : "Arm"}</Button>
					<Button warning={true} color={darkred} onClick={() => httppost("/ugv/restart")} title="Restart the UGV's Pixhawk.">Restart?</Button>
				</Row>
			</Column>
		</div>
	)
}

const UAV = styled(RawUAV)`
	height: 6em;
	width: 8em;
	margin-right: 0;
	margin-left: auto;
	margin-bottom: -0.9em;
`

const UGV = styled(RawUGV)`
	height: 3em;
	width: 5em;
	margin-right: 0;
	margin-left: auto;
	margin-top: auto;
	margin-bottom: -0.25em;
`

const StyledDiv = styled.div`
 	display: flex;
	margin-top: -0.5em;
 	margin-bottom: 1em;
`

export default Actions
